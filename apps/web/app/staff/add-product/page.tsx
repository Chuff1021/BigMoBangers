"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackagePlus,
  ScanLine,
} from "lucide-react";
import { WebScanner } from "@/components/staff/web-scanner";
import { useToast } from "@/components/ui/toast";

interface ExistingProduct {
  id: string;
  name: string;
  price: string;
  sku: string | null;
  barcode: string | null;
}

function cleanPrice(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return "";
  const number = Number(normalized);
  if (!Number.isFinite(number)) return "";
  return number.toFixed(2);
}

export default function StaffAddProduct() {
  const { toast } = useToast();
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<ExistingProduct | null>(null);
  const [created, setCreated] = useState<ExistingProduct | null>(null);

  async function findExisting(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return null;

    const res = await fetch(
      `/api/products/scan?tenant=bigmos&code=${encodeURIComponent(trimmed)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as ExistingProduct;
  }

  async function checkExisting(code: string) {
    setExisting(null);
    setChecking(true);
    try {
      setExisting(await findExisting(code));
    } finally {
      setChecking(false);
    }
  }

  function onScan(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBarcode(trimmed);
    setCreated(null);
    void checkExisting(trimmed);
    navigator.vibrate?.(35);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedBarcode = barcode.trim();
    const trimmedName = name.trim();
    const normalizedPrice = cleanPrice(price);
    const trimmedSku = sku.trim();
    const startingQty = Math.max(0, Number.parseInt(qty, 10) || 0);

    if (!trimmedBarcode || !trimmedName || !normalizedPrice) {
      toast({
        title: "Barcode, name, and price are required",
        variant: "destructive",
      });
      return;
    }
    setChecking(true);
    const duplicate = await findExisting(trimmedBarcode);
    setChecking(false);
    if (duplicate) {
      setExisting(duplicate);
      toast({
        title: "That barcode is already in inventory",
        description: duplicate.name,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const tags = [
        "pos-only",
        "staff-added",
        "source:staff-app",
        `barcode:${trimmedBarcode}`,
        trimmedSku ? `sku:${trimmedSku}` : null,
      ].filter(Boolean);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          sku: trimmedSku || undefined,
          barcode: trimmedBarcode,
          price: normalizedPrice,
          inventoryQty: startingQty,
          lowStockThreshold: 0,
          trackInventory: true,
          isFeatured: false,
          isActive: false,
          tags,
          description: "Added from staff app for in-person sales only.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Could not add product");

      const product = data as ExistingProduct;
      setCreated(product);
      setBarcode("");
      setName("");
      setPrice("");
      setSku("");
      setQty("");
      setExisting(null);
      toast({ title: "Product added to staff inventory", variant: "success" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not add product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-4">
      <Link href="/staff" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Staff
      </Link>

      <WebScanner onScan={onScan} active={!saving} />

      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
        {checking ? "Checking barcode..." : barcode ? `Scanned ${barcode}` : "Scan or type a barcode"}
      </div>

      {existing && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          Already in inventory: {existing.name} · ${Number(existing.price).toFixed(2)}
        </div>
      )}

      {created && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Added {created.name}
        </div>
      )}

      <form onSubmit={submit} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-usared">
            <PackagePlus className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold">Add POS-only product</h1>
            <p className="text-xs text-slate-500">Hidden from the mobile store.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Barcode *</span>
            <input
              value={barcode}
              onChange={(e) => {
                setBarcode(e.target.value);
                setCreated(null);
                setExisting(null);
              }}
              onBlur={() => checkExisting(barcode)}
              inputMode="numeric"
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
              placeholder="Scan or enter barcode"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Product name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
              placeholder="Firework name"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-500">Price *</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => setPrice(cleanPrice(price))}
                inputMode="decimal"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
                placeholder="0.00"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-500">Starting qty</span>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
                placeholder="0"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Item #</span>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
              placeholder="Optional"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || checking || Boolean(existing)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-usared py-3.5 font-bold text-white disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
          Add to staff inventory
        </button>
      </form>
    </div>
  );
}
