"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ScanLine,
  Trash2,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { WebScanner } from "@/components/staff/web-scanner";
import { useToast } from "@/components/ui/toast";

interface ScannedProduct {
  id: string;
  name: string;
  price: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  tags?: string[];
}
interface Line {
  product: ScannedProduct;
  qty: number;
}
const TAX_RATE = 0.0825;
const money = (n: number) => `$${n.toFixed(2)}`;
type SaleMethod = "cash" | "clover_terminal";

const saleMethodLabels: Record<SaleMethod, string> = {
  cash: "Cash",
  clover_terminal: "Card",
};

function normalizeCode(code: string) {
  return code.trim().toLowerCase();
}

function productCodes(product: ScannedProduct) {
  const codes = new Set<string>();
  const values = [product.id, product.sku, product.barcode, ...(product.tags ?? [])];

  for (const raw of values) {
    const value = String(raw ?? "").trim();
    if (!value) continue;
    codes.add(value);
    codes.add(value.replace(/\s+/g, ""));

    const separator = value.indexOf(":");
    if (separator > -1) {
      const stripped = value.slice(separator + 1).trim();
      if (stripped) {
        codes.add(stripped);
        codes.add(stripped.replace(/\s+/g, ""));
      }
    }
  }

  return Array.from(codes).map(normalizeCode).filter(Boolean);
}

function buildProductIndex(products: ScannedProduct[]) {
  const index = new Map<string, ScannedProduct>();
  const collisions = new Set<string>();

  for (const product of products) {
    for (const code of productCodes(product)) {
      const existing = index.get(code);
      if (existing && existing.id !== product.id) {
        collisions.add(code);
        continue;
      }
      index.set(code, product);
    }
  }

  for (const code of collisions) index.delete(code);
  return index;
}

function checkoutPulse() {
  if (typeof window === "undefined") return;
  navigator.vibrate?.(35);

  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.09);
    window.setTimeout(() => void ctx.close(), 140);
  } catch {
    // Some mobile browsers block audio feedback until user interaction.
  }
}

export default function StaffCheckout() {
  const { toast } = useToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [saleMethod, setSaleMethod] = useState<SaleMethod>("clover_terminal");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; total: string; method: SaleMethod } | null>(null);
  const productIndex = useMemo(() => buildProductIndex(products), [products]);

  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const missingPrice = lines.some((l) => Number(l.product.price) <= 0);
  const canRecord = lines.length > 0 && !busy && !missingPrice && total > 0;

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const res = await fetch("/api/staff/products", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Could not load scanner inventory");
        if (!cancelled) {
          setProducts(data);
          setInventoryError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setInventoryError(err instanceof Error ? err.message : "Could not load scanner inventory");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  function addProduct(product: ScannedProduct) {
    setLines((prev) => {
      const ex = prev.find((l) => l.product.id === product.id);
      if (ex) return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { product, qty: 1 }];
    });
    setLastAdded(product.name);
    checkoutPulse();
  }

  async function lookupRemote(code: string) {
    const res = await fetch(
      `/api/products/scan?tenant=bigmos&code=${encodeURIComponent(code)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as ScannedProduct;
  }

  async function onScan(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    const product = productIndex.get(normalizeCode(trimmed)) ?? productIndex.get(normalizeCode(trimmed.replace(/\s+/g, "")));
    if (product) {
      addProduct(product);
      return;
    }

    if (loadingProducts && products.length === 0) {
      setLastAdded("Loading scanner inventory...");
    }

    try {
      const remoteProduct = await lookupRemote(trimmed);
      if (!remoteProduct) {
        toast({ title: `No match for ${trimmed}`, variant: "destructive" });
        return;
      }
      addProduct(remoteProduct);
    } catch {
      toast({ title: "Scan failed", variant: "destructive" });
    }
  }

  function setQty(id: string, q: number) {
    setLines((prev) =>
      q <= 0 ? prev.filter((l) => l.product.id !== id) : prev.map((l) => (l.product.id === id ? { ...l, qty: q } : l))
    );
  }

  async function recordSale() {
    if (lines.length === 0) return;
    if (missingPrice) {
      toast({ title: "One item is missing a price", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: saleMethod,
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Sale failed");
      setDone({ orderNumber: data.orderNumber, total: data.total, method: saleMethod });
      setLines([]);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not record sale",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-extrabold">Sale recorded</h1>
        <div className="mt-1 font-semibold text-usared">{done.orderNumber}</div>
        <div className="mt-1 text-3xl font-extrabold">{money(Number(done.total))}</div>
        <div className="mt-1 text-sm font-semibold text-slate-500">
          Paid by {saleMethodLabels[done.method]}
        </div>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Inventory was reduced and the sale is saved in orders.
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => setDone(null)} className="rounded-xl bg-usared px-6 py-3 font-bold text-white">
            Next customer
          </button>
          <Link href="/staff" className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700">
            Done
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <Link href="/staff" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Staff
      </Link>

      <WebScanner onScan={onScan} active={!busy} />

      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
        <span>
          {loadingProducts
            ? "Loading scanner inventory..."
            : inventoryError
              ? "Scanner inventory fallback mode"
              : `Ready: ${productIndex.size} scan codes`}
        </span>
        {lastAdded && <span className="max-w-[52%] truncate text-emerald-700">Added {lastAdded}</span>}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onScan(manualCode);
          setManualCode("");
        }}
      >
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Enter barcode or SKU"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-usared"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
        >
          <ScanLine className="h-4 w-4" />
          Add
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Ticket</h2>
          <span className="text-sm text-slate-500">{count} item{count === 1 ? "" : "s"}</span>
        </div>

        <div className="mt-2 divide-y divide-slate-100">
          {lines.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">Scan a barcode to add the first item.</p>
          )}
          {lines.map((l) => (
            <div key={l.product.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{l.product.name}</div>
                <div className="text-xs text-slate-500">
                  {Number(l.product.price) > 0 ? money(Number(l.product.price)) : "Price missing"}
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
                <button onClick={() => setQty(l.product.id, l.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded text-slate-600">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-6 text-center text-sm font-semibold">{l.qty}</span>
                <button onClick={() => setQty(l.product.id, l.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded text-slate-600">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="w-16 text-right font-bold">{money(Number(l.product.price) * l.qty)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="text-slate-900">{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Tax (8.25%)</span><span className="text-slate-900">{money(tax)}</span></div>
          <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>{money(total)}</span></div>
        </div>

        {missingPrice && (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            One scanned item is missing a price. Update that product before recording the sale.
          </div>
        )}

        <div className="mt-3">
          <div className="text-xs font-bold uppercase text-slate-500">Payment taken</div>
          <div className="mt-2 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSaleMethod("clover_terminal")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-extrabold transition ${
                saleMethod === "clover_terminal"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setSaleMethod("cash")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-extrabold transition ${
                saleMethod === "cash"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Cash
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
          <button
            disabled={busy || lines.length === 0}
            onClick={() => setLines([])}
            className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-bold text-slate-700 disabled:opacity-40"
            aria-label="Clear ticket"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            disabled={!canRecord}
            onClick={recordSale}
            className="flex items-center justify-center gap-2 rounded-xl bg-usared py-3.5 font-bold text-white disabled:opacity-40"
          >
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {saleMethod === "cash" ? "Record cash sale" : "Record sale after Clover payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
