"use client";

import Link from "next/link";
import { Camera, Play, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-context";
import { useToast } from "@/components/ui/toast";

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  youtubeUrl: string | null;
  isFeatured: boolean;
  inventoryQty: number;
  trackInventory: boolean;
  lowStockThreshold: number;
  category: { name: string; emoji: string } | null;
}

export function ProductCard({ product }: { product: StoreProduct; featured?: boolean }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const out = product.trackInventory && product.inventoryQty <= 0;
  const low =
    product.trackInventory &&
    product.inventoryQty > 0 &&
    product.inventoryQty <= product.lowStockThreshold;
  const photoCount = [product.imageUrl, ...product.images].filter(Boolean).length;

  function add() {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      emoji: product.category?.emoji,
    });
    toast({ title: `Added ${product.name}`, variant: "success" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card-lite card-hover group flex flex-col overflow-hidden">
      <Link href={`/product/${product.id}`} className="relative block">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50 p-3">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="text-6xl">{product.category?.emoji ?? "🎆"}</span>
          )}

          {product.isFeatured && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-usared px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Featured
            </span>
          )}
          {out && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Sold out
            </span>
          )}
          {!out && low && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-900">
              Low stock
            </span>
          )}

          <div className="absolute bottom-2.5 left-2.5 flex gap-1">
            {photoCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                <Camera className="h-3 w-3" /> {photoCount}
              </span>
            )}
            {product.youtubeUrl && (
              <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                <Play className="h-3 w-3" /> Video
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        {product.category && (
          <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-usablue">
            {product.category.name}
          </span>
        )}
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-usared">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            disabled={out}
            onClick={add}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-all ${
              out
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : added
                  ? "bg-emerald-600 text-white"
                  : "bg-usared text-white hover:bg-usared-dark"
            }`}
            aria-label="Add to cart"
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
