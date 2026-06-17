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
  const [sort, setSort] = useState("featured");

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

  const sortedProducts = useMemo(() => {
    const list = products.slice();
    if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return list;
  }, [products, sort]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">
            The catalog
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Shop fireworks
          </h1>
        </div>
        <span className="text-sm text-slate-500">{sortedProducts.length} products</span>
      </div>

      {/* Search + sort */}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-400">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
          aria-label="Sort products"
        >
          <option value="featured">Featured first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name: A–Z</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = categoryId === c.id;
          return (
            <button
              key={c.name}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-usablue text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <span className="mr-1">{c.emoji}</span> {c.name}
            </button>
          );
        })}
      </div>

      {sortedProducts.length === 0 ? (
        <div className="card-lite flex flex-col items-center py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-slate-500">No fireworks match. Try another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
