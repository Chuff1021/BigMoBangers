"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CreditCard, PartyPopper } from "lucide-react";
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
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
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

      // Live Clover: redirect to hosted pay page.
      if (data.href) {
        window.location.href = data.href;
        return;
      }

      // Demo: payment simulated as approved.
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
      <div className="glass ring-anim mx-auto max-w-lg rounded-3xl">
        <div className="glass flex flex-col items-center rounded-3xl px-6 py-12 text-center">
          <PartyPopper className="h-16 w-16 text-gold" />
          <h1 className="mt-4 font-display text-4xl tracking-wider text-rwb">ORDER PLACED!</h1>
          {orderNumber && (
            <div className="mt-2 font-display text-2xl tracking-wide text-gold">{orderNumber}</div>
          )}
          <p className="mt-3 text-muted-foreground">
            We&apos;ll have your order ready! Show your order number at the tent for pickup.
            You&apos;ll get a text when it&apos;s good to go. 🇺🇸
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="glow-red rounded-xl bg-brand px-6 py-3 font-display text-lg tracking-wide text-white"
            >
              BACK TO HOME
            </Link>
            <Link
              href="/orders"
              className="glass rounded-xl px-6 py-3 font-display text-lg tracking-wide text-white"
            >
              MY ORDERS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="font-display text-4xl tracking-wider text-rwb">CHECKOUT</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll text you when your order is ready for pickup.
        </p>

        <div className="glass space-y-4 rounded-2xl p-5">
          <Field label="Name" value={name} onChange={setName} required placeholder="Your name" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="417-555-0100" />
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">Pickup note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions?"
              className="min-h-20 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
            />
          </div>
          {error && <p className="text-sm text-brand">{error}</p>}
        </div>
      </div>

      {/* Summary + pay */}
      <div className="glass h-fit rounded-2xl p-5">
        <h2 className="mb-3 font-display text-2xl tracking-wide text-white">ORDER</h2>
        <div className="max-h-52 space-y-1.5 overflow-auto text-sm">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-muted-foreground">
              <span className="truncate pr-2">
                {i.quantity}× {i.name}
              </span>
              <span className="text-white">${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="my-3 h-px bg-white/10" />
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span className="text-white">${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-display text-2xl tracking-wide text-gold">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={pay}
          disabled={stage === "processing"}
          className="glow-red mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-display text-xl tracking-wide text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {stage === "processing" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          {stage === "processing" ? "PROCESSING…" : "PAY WITH CLOVER"}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Powered by Clover · pay securely
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
      <label className="mb-1.5 block text-sm font-semibold text-white">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric"
      />
    </div>
  );
}
