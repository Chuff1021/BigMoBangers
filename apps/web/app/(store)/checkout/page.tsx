"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CreditCard, PartyPopper, Lock } from "lucide-react";
import { useCart, TAX_RATE } from "@/components/store/cart-context";

type Stage = "form" | "processing" | "done";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [stage, setStage] = useState<Stage>("form");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  async function pay() {
    if (!name.trim()) return setError("Please enter your name.");
    if (items.length === 0) return setError("Your cart is empty.");
    setError("");
    setStage("processing");
    try {
      const res = await fetch("/api/clover/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim() || undefined,
          customerEmail: email.trim() || undefined,
          pickupNote: note.trim() || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Checkout failed");
      if (data.href) {
        window.location.href = data.href;
        return;
      }
      setOrderNumber(data.orderNumber);
      clear();
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setStage("form");
    }
  }

  if (stage === "done") {
    return (
      <div className="card-lite mx-auto max-w-lg px-6 py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Order placed!</h1>
        {orderNumber && (
          <div className="mt-1 text-lg font-bold text-usared">{orderNumber}</div>
        )}
        <p className="mt-3 text-slate-600">
          We&apos;ll have your order ready! Show your order number at the tent for pickup.
          You&apos;ll get a text when it&apos;s good to go. 🇺🇸
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-usared px-6 py-3 text-sm font-semibold text-white hover:bg-usared-dark">
            Back to home
          </Link>
          <Link href="/orders" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">
            Track order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500">We&apos;ll text you when your order is ready for pickup.</p>

        <div className="card-lite space-y-4 p-5">
          <Field label="Name" value={name} onChange={setName} required placeholder="Your name" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="417-555-0100" />
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pickup note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions?"
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-medium text-usared">{error}</p>}
        </div>
      </div>

      {/* Summary + pay */}
      <div className="card-lite h-fit p-5">
        <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Your order</h2>
        <div className="max-h-52 space-y-1.5 overflow-auto text-sm">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-slate-500">
              <span className="truncate pr-2">{i.quantity}× {i.name}</span>
              <span className="text-slate-900">${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="my-3 h-px bg-slate-200" />
        <div className="space-y-1 text-sm text-slate-500">
          <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900">${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span className="text-slate-900">${tax.toFixed(2)}</span></div>
          <div className="flex justify-between pt-1 text-lg font-bold text-slate-900">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={pay}
          disabled={stage === "processing"}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-usared py-3.5 text-sm font-semibold text-white transition-colors hover:bg-usared-dark disabled:opacity-60"
        >
          {stage === "processing" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
          {stage === "processing" ? "Processing…" : "Pay with Clover"}
        </button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <Lock className="h-3 w-3" /> Secure checkout powered by Clover
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}
