"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
    () => [{ id: undefined as string | undefined, name: "All categories", emoji: "" }, ...categories],
    [categories]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of initialProducts) {
      if (product.category?.name) {
        counts.set(product.category.name, (counts.get(product.category.name) ?? 0) + 1);
      }
    }
    return counts;
  }, [initialProducts]);

  const activeCategoryName =
    chips.find((category) => category.id === categoryId)?.name ?? "All categories";

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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400 focus-within:bg-white">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Categories</h2>
                <p className="text-xs text-slate-500">{activeCategoryName}</p>
              </div>
            </div>
            {categoryId && (
              <button
                type="button"
                onClick={() => setCategoryId(undefined)}
                className="text-sm font-semibold text-usared hover:text-usared-dark"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={categoryId ?? ""}
            onChange={(event) => setCategoryId(event.target.value || undefined)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-400 md:hidden"
            aria-label="Filter by category"
          >
            {chips.map((category) => (
              <option key={category.name} value={category.id ?? ""}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="hidden max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid lg:grid-cols-4 xl:grid-cols-5">
            {chips.map((category) => {
              const active = categoryId === category.id;
              const count =
                category.id === undefined ? initialProducts.length : categoryCounts.get(category.name);
              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    active
                      ? "border-usablue bg-usablue text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  {typeof count === "number" && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                        active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
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
