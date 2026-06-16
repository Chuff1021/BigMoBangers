"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";
import { useToast } from "@/components/ui/toast";

export function AddToCartPanel({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
    emoji?: string;
    outOfStock: boolean;
  };
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-muted-foreground">Quantity</span>
        <div className="glass flex items-center gap-3 rounded-full px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-6 text-center font-display text-xl tracking-wide">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={product.outOfStock}
          onClick={() => {
            addItem(
              {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                emoji: product.emoji,
              },
              qty
            );
            toast({ title: `Added ${qty} × ${product.name}`, variant: "success" });
          }}
          className={`flex items-center gap-2 rounded-xl px-6 py-3.5 font-display text-xl tracking-wide transition-transform ${
            product.outOfStock
              ? "cursor-not-allowed bg-white/10 text-white/40"
              : "glow-red bg-brand text-white hover:scale-105"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          {product.outOfStock ? "SOLD OUT" : "ADD TO CART"}
        </button>
        <button
          disabled={product.outOfStock}
          onClick={() => {
            addItem(
              {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                emoji: product.emoji,
              },
              qty
            );
            router.push("/cart");
          }}
          className="glass rounded-xl px-6 py-3.5 font-display text-xl tracking-wide text-white transition-transform hover:scale-105 disabled:opacity-40"
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
