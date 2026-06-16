"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, TAX_RATE } from "@/components/store/cart-context";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="glass mx-auto flex max-w-lg flex-col items-center rounded-3xl py-16 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl tracking-wide text-white">YOUR CART IS EMPTY</h1>
        <p className="mt-1 text-muted-foreground">Add some bangers and light up the night.</p>
        <Link
          href="/shop"
          className="glow-red mt-6 rounded-xl bg-brand px-6 py-3 font-display text-lg tracking-wide text-white"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-wider text-rwb">YOUR CART</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="glass flex items-center gap-4 rounded-2xl p-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">{item.emoji ?? "🎆"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">{item.name}</div>
                <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-display text-xl tracking-wide text-gold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-brand"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass h-fit rounded-2xl p-5">
          <h2 className="mb-4 font-display text-2xl tracking-wide text-white">SUMMARY</h2>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={subtotal} />
            <Row label="Estimated tax (8.25%)" value={tax} />
            <div className="my-2 h-px bg-white/10" />
            <div className="flex justify-between font-display text-2xl tracking-wide text-gold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="glow-red mt-5 block rounded-xl bg-brand py-3.5 text-center font-display text-xl tracking-wide text-white transition-transform hover:scale-[1.02]"
          >
            CHECKOUT
          </Link>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Secure payment via Clover
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-white">${value.toFixed(2)}</span>
    </div>
  );
}
