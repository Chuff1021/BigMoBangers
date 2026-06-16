"use client";

import Link from "next/link";
import { Plus, Flame } from "lucide-react";
import { useCart } from "./cart-context";
import { useToast } from "@/components/ui/toast";

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  inventoryQty: number;
  trackInventory: boolean;
  lowStockThreshold: number;
  category: { name: string; emoji: string } | null;
}

export function ProductCard({ product, featured }: { product: StoreProduct; featured?: boolean }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const out = product.trackInventory && product.inventoryQty <= 0;
  const low =
    product.trackInventory &&
    product.inventoryQty > 0 &&
    product.inventoryQty <= product.lowStockThreshold;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl ${
        featured ? "ring-anim" : ""
      }`}
    >
      <div className="glass flex h-full flex-col">
        <Link href={`/product/${product.id}`} className="relative block">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-navy/40 to-black/40">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-6xl drop-shadow-[0_0_20px_rgba(255,59,48,0.5)] transition-transform duration-500 group-hover:scale-110">
                {product.category?.emoji ?? "🎆"}
              </span>
            )}
            {product.isFeatured && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Flame className="h-3 w-3" /> Hot
              </span>
            )}
            {out && (
              <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white/80">
                Sold out
              </span>
            )}
            {low && (
              <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                Low stock
              </span>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-3">
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-1 font-semibold text-white hover:text-electric">
              {product.name}
            </h3>
          </Link>
          <p className="mb-3 line-clamp-1 text-xs text-muted-foreground">
            {product.category?.emoji} {product.category?.name}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="font-display text-2xl tracking-wide text-gold">
              ${Number(product.price).toFixed(2)}
            </span>
            <button
              disabled={out}
              onClick={() => {
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: Number(product.price),
                  imageUrl: product.imageUrl,
                  emoji: product.category?.emoji,
                });
                toast({ title: `Added ${product.name}`, variant: "success" });
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                out
                  ? "cursor-not-allowed bg-white/10 text-white/30"
                  : "bg-brand text-white hover:scale-110 hover:shadow-[0_0_18px_-2px_rgba(255,59,48,0.8)]"
              }`}
              aria-label="Add to cart"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
