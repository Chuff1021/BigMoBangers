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

  const item = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    emoji: product.emoji,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-700">Quantity</span>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center text-lg font-semibold text-slate-900">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          disabled={product.outOfStock}
          onClick={() => {
            addItem(item, qty);
            toast({ title: `Added ${qty} × ${product.name}`, variant: "success" });
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors ${
            product.outOfStock
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-usared text-white hover:bg-usared-dark"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          {product.outOfStock ? "Sold out" : "Add to cart"}
        </button>
        <button
          disabled={product.outOfStock}
          onClick={() => {
            addItem(item, qty);
            router.push("/cart");
          }}
          className="flex-1 rounded-xl border border-usablue bg-white px-6 py-3.5 text-sm font-semibold text-usablue transition-colors hover:bg-usablue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
