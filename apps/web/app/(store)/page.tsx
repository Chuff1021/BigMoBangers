import Image from "next/image";
import Link from "next/link";
import { Flame, Zap, ShieldCheck, Truck } from "lucide-react";
import { listProducts, listCategories } from "@/lib/store";
import { ProductCard, type StoreProduct } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

function toStore(p: Awaited<ReturnType<typeof listProducts>>[number]): StoreProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    inventoryQty: p.inventoryQty,
    trackInventory: p.trackInventory,
    lowStockThreshold: p.lowStockThreshold,
    category: p.category ? { name: p.category.name, emoji: p.category.emoji } : null,
  };
}

export default async function StoreHome() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);
  const featured = products.filter((p) => p.isFeatured).map(toStore);
  const all = products.map(toStore);

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="ring-anim rounded-3xl">
          <div className="glass relative rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
            {/* floating sparks */}
            <div className="pointer-events-none absolute inset-0 select-none">
              <span className="animate-float absolute left-[8%] top-[18%] text-3xl opacity-70">🎆</span>
              <span className="animate-float absolute right-[10%] top-[12%] text-4xl opacity-70" style={{ animationDelay: "1s" }}>🎇</span>
              <span className="animate-float absolute bottom-[14%] left-[14%] text-3xl opacity-60" style={{ animationDelay: "2s" }}>✨</span>
              <span className="animate-float absolute bottom-[20%] right-[16%] text-3xl opacity-60" style={{ animationDelay: "0.5s" }}>🧨</span>
            </div>

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="shimmer mx-auto mb-6 inline-block rounded-2xl ring-1 ring-white/15">
                <Image
                  src="/brand/logo.png"
                  alt="Big MO's Bangers"
                  width={1290}
                  height={689}
                  priority
                  className="mx-auto w-full max-w-md rounded-2xl"
                />
              </div>
              <h1 className="font-display text-5xl leading-none tracking-wider text-rwb sm:text-7xl">
                LIGHT UP THE SKY
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Premium aerials, monster cakes, and family packs — order ahead and skip
                the line at the tent in Republic, MO.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/shop"
                  className="glow-red rounded-xl bg-brand px-7 py-3.5 font-display text-xl tracking-wide text-white transition-transform hover:scale-105"
                >
                  SHOP FIREWORKS
                </Link>
                <Link
                  href="#featured"
                  className="glass rounded-xl px-7 py-3.5 font-display text-xl tracking-wide text-white transition-transform hover:scale-105"
                >
                  SEE THE HOT DEALS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Zap, label: "Biggest Bangs", tint: "text-brand" },
          { icon: ShieldCheck, label: "Low Prices", tint: "text-electric" },
          { icon: Truck, label: "Order Ahead", tint: "text-gold" },
          { icon: Flame, label: "Pickup Ready", tint: "text-brand" },
        ].map((f) => (
          <div key={f.label} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
            <f.icon className={`h-6 w-6 ${f.tint}`} />
            <span className="text-sm font-semibold text-white">{f.label}</span>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section>
        <h2 className="mb-4 font-display text-3xl tracking-wider text-white">SHOP BY CATEGORY</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?categoryId=${c.id}`}
              className="glass rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:text-electric"
            >
              <span className="mr-1">{c.emoji}</span> {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section id="featured">
          <h2 className="mb-4 flex items-center gap-2 font-display text-3xl tracking-wider text-rwb">
            <Flame className="h-7 w-7 text-brand" /> HOT DEALS
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} featured />
            ))}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS */}
      <section>
        <h2 className="mb-4 font-display text-3xl tracking-wider text-white">ALL FIREWORKS</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
