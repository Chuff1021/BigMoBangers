"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, TAX_RATE } from "@/components/store/cart-context";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="card-lite mx-auto flex max-w-lg flex-col items-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Your cart is empty</h1>
        <p className="mt-1 text-slate-500">Add some bangers and light up the night.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-usared px-6 py-3 text-sm font-semibold text-white hover:bg-usared-dark"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="card-lite flex items-center gap-4 p-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1.5">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-2xl">{item.emoji ?? "🎆"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">${item.price.toFixed(2)} each</div>
                <div className="mt-2 flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 w-fit">
                  <button
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-7 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-bold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-slate-400 hover:text-usared"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-lite h-fit p-5">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Order summary</h2>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={subtotal} />
            <Row label="Estimated tax (8.25%)" value={tax} />
            <div className="my-2 h-px bg-slate-200" />
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-usared py-3.5 text-sm font-semibold text-white transition-colors hover:bg-usared-dark"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-xs text-slate-400">Secure payment via Clover</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-500">
      <span>{label}</span>
      <span className="text-slate-900">${value.toFixed(2)}</span>
    </div>
  );
}
