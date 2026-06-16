"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard, type StoreProduct } from "./product-card";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

export function ShopBrowser({
  initialProducts,
  categories,
  initialCategoryId,
}: {
  initialProducts: StoreProduct[];
  categories: Category[];
  initialCategoryId?: string;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);

  useEffect(() => {
    const params = new URLSearchParams({ tenant: "bigmos" });
    if (categoryId) params.set("categoryId", categoryId);
    if (search.trim()) params.set("search", search.trim());
    const ctrl = new AbortController();
    fetch(`/api/products?${params.toString()}`, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((data: StoreProduct[]) => setProducts(data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [search, categoryId]);

  const chips = useMemo(
    () => [{ id: undefined as string | undefined, name: "All", emoji: "🎆" }, ...categories],
    [categories]
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-wider text-rwb">SHOP FIREWORKS</h1>

      <div className="glass flex items-center gap-2 rounded-xl px-4 py-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the arsenal…"
          className="w-full bg-transparent text-base text-white placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = categoryId === c.id;
          return (
            <button
              key={c.name}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active ? "glow-red bg-brand text-white" : "glass text-white hover:text-electric"
              }`}
            >
              <span className="mr-1">{c.emoji}</span> {c.name}
            </button>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl py-16 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-3 text-muted-foreground">No fireworks match. Try another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
