"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  category: { name: string; emoji: string } | null;
  inventoryQty: number;
  trackInventory: boolean;
}
interface Line {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const TAX_RATE = 0.0825;

export default function RegisterPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Line[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"cash" | "card">("card");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/products?tenant=bigmos", { cache: "no-store" })
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, search]);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = cart.reduce((s, l) => s + l.quantity, 0);

  function add(p: Product) {
    setCart((prev) => {
      const ex = prev.find((l) => l.productId === p.id);
      if (ex) return prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { productId: p.id, name: p.name, price: Number(p.price), quantity: 1 }];
    });
  }
  function setQty(id: string, q: number) {
    setCart((prev) =>
      q <= 0 ? prev.filter((l) => l.productId !== id) : prev.map((l) => (l.productId === id ? { ...l, quantity: q } : l))
    );
  }

  async function charge() {
    if (cart.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          customerName: name || undefined,
          customerPhone: phone || undefined,
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Sale failed");
      if (data.href) window.open(data.href, "_blank");
      setDone({ orderNumber: data.orderNumber, total: Number(data.total) });
      setCart([]);
      setName("");
      setPhone("");
      toast({ title: `Sale complete · ${data.orderNumber}`, variant: "success" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Sale failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Point of sale</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Register</h1>
        <p className="text-sm text-slate-500">Ring up a walk-up sale and take payment at the counter.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Product picker */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-400">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products to add…"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p)}
                className="card-lite card-hover flex flex-col p-3 text-left"
              >
                <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-3xl">{p.category?.emoji ?? "🎆"}</span>
                  )}
                </div>
                <span className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">{p.name}</span>
                <span className="text-sm font-bold text-slate-900">${Number(p.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket */}
        <div className="card-lite flex h-fit flex-col p-4 lg:sticky lg:top-6">
          {done ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              <h2 className="mt-3 text-xl font-bold text-slate-900">Sale complete</h2>
              <div className="mt-1 font-semibold text-usared">{done.orderNumber}</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">${done.total.toFixed(2)}</div>
              <button
                onClick={() => setDone(null)}
                className="mt-6 rounded-xl bg-usared px-6 py-3 text-sm font-semibold text-white hover:bg-usared-dark"
              >
                New sale
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Ticket</h2>
                <span className="text-sm text-slate-500">{count} item{count === 1 ? "" : "s"}</span>
              </div>

              <div className="my-3 max-h-64 space-y-2 overflow-auto">
                {cart.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">Tap products to add them.</p>
                )}
                {cart.map((l) => (
                  <div key={l.productId} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">{l.name}</div>
                      <div className="text-xs text-slate-500">${l.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
                      <button onClick={() => setQty(l.productId, l.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-100"><Minus className="h-3 w-3" /></button>
                      <span className="min-w-6 text-center text-sm font-semibold">{l.quantity}</span>
                      <button onClick={() => setQty(l.productId, l.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-100"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="w-16 text-right text-sm font-bold text-slate-900">${(l.price * l.quantity).toFixed(2)}</span>
                    <button onClick={() => setQty(l.productId, 0)} className="text-slate-300 hover:text-usared"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none" />
              </div>

              <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="text-slate-900">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Tax (8.25%)</span><span className="text-slate-900">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between pt-1 text-lg font-bold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["card", "cash"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold capitalize transition-colors ${
                      method === m ? "border-usablue bg-usablue text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {m === "card" ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />} {m}
                  </button>
                ))}
              </div>

              <button
                onClick={charge}
                disabled={busy || cart.length === 0}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-usared py-3.5 text-sm font-bold text-white transition-colors hover:bg-usared-dark disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {busy ? "Processing…" : `Charge $${total.toFixed(2)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
