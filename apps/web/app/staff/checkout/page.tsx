"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { WebScanner } from "@/components/staff/web-scanner";
import { useToast } from "@/components/ui/toast";

interface ScannedProduct {
  id: string;
  name: string;
  price: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
}
interface Line {
  product: ScannedProduct;
  qty: number;
}
const TAX_RATE = 0.0825;
const money = (n: number) => `$${n.toFixed(2)}`;

export default function StaffCheckout() {
  const { toast } = useToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; total: string } | null>(null);

  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = lines.reduce((s, l) => s + l.qty, 0);

  async function onScan(code: string) {
    try {
      const res = await fetch(
        `/api/products/scan?tenant=bigmos&code=${encodeURIComponent(code)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        toast({ title: `No match for ${code}`, variant: "destructive" });
        return;
      }
      const product = (await res.json()) as ScannedProduct;
      setLines((prev) => {
        const ex = prev.find((l) => l.product.id === product.id);
        if (ex) return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
        return [...prev, { product, qty: 1 }];
      });
      toast({ title: `Added ${product.name}`, variant: "success" });
    } catch {
      toast({ title: "Scan failed", variant: "destructive" });
    }
  }

  function setQty(id: string, q: number) {
    setLines((prev) =>
      q <= 0 ? prev.filter((l) => l.product.id !== id) : prev.map((l) => (l.product.id === id ? { ...l, qty: q } : l))
    );
  }

  async function charge(method: "cash" | "card") {
    if (lines.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Sale failed");
      if (data.href) window.open(data.href, "_blank");
      setDone({ orderNumber: data.orderNumber, total: data.total });
      setLines([]);
    } catch {
      toast({ title: "Sale failed — try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-extrabold">Sale complete</h1>
        <div className="mt-1 font-semibold text-usared">{done.orderNumber}</div>
        <div className="mt-1 text-3xl font-extrabold">{money(Number(done.total))}</div>
        <div className="mt-8 flex gap-3">
          <button onClick={() => setDone(null)} className="rounded-xl bg-usared px-6 py-3 font-bold text-white">
            New sale
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
                <div className="text-xs text-slate-500">{money(Number(l.product.price))}</div>
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

        <div className="mt-3 flex gap-2">
          <button
            disabled={busy || lines.length === 0}
            onClick={() => charge("cash")}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-3.5 font-bold text-slate-700 disabled:opacity-40"
          >
            Cash
          </button>
          <button
            disabled={busy || lines.length === 0}
            onClick={() => charge("card")}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-usared py-3.5 font-bold text-white disabled:opacity-40"
          >
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            Charge {money(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
