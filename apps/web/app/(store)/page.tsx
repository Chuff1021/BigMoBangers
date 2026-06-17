import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Smartphone,
  ShoppingCart,
  CreditCard,
  MapPin,
} from "lucide-react";
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
    images: p.images,
    youtubeUrl: p.youtubeUrl,
    isFeatured: p.isFeatured,
    inventoryQty: p.inventoryQty,
    trackInventory: p.trackInventory,
    lowStockThreshold: p.lowStockThreshold,
    category: p.category ? { name: p.category.name, emoji: p.category.emoji } : null,
  };
}

export default async function StoreHome() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const featured = products.filter((p) => p.isFeatured).map(toStore).slice(0, 8);
  const all = products.map(toStore).slice(0, 12);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="card-lite lite-grid relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-usablue">
              <Sparkles className="h-3.5 w-3.5 text-usared" /> Republic, MO · Order ahead
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              Light up the sky with{" "}
              <span className="text-usagrad">Big&nbsp;MO&apos;s&nbsp;Bangers</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              Premium aerials, 500‑gram cakes, and family packs at low prices.
              Shop online, reserve your stock, and pick up at the tent.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-usared px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-usared-dark"
              >
                Shop fireworks <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                View featured
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <Image
                src="/brand/logo.png"
                alt="Big MO's Bangers"
                width={1290}
                height={689}
                priority
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Sparkles, title: "Premium brands", sub: "Top-tier cakes & aerials" },
          { icon: ShieldCheck, title: "Low prices", sub: "Tent pricing, online ease" },
          { icon: Clock, title: "Reserve ahead", sub: "Lock in your stock" },
          { icon: Truck, title: "Fast pickup", sub: "Skip the line" },
        ].map((f) => (
          <div key={f.title} className="card-lite flex items-start gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-usared ring-1 ring-slate-200">
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-900">{f.title}</div>
              <div className="text-xs text-slate-500">{f.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* MOBILE ORDERING / PICKUP HIGHLIGHT */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="usa-stripe h-1 w-full" />
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-usared">
              <Smartphone className="h-3.5 w-3.5" /> Order from your phone
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Order online. <span className="text-usagrad">Pick up at the tent.</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
              Build your order from the couch, pay securely, and we&apos;ll have it
              boxed and ready. No digging through bins, no waiting in line on the 4th.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-usared px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-usared-dark"
              >
                Start your order <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                <MapPin className="h-4 w-4 text-usablue" /> Track a pickup
              </Link>
            </div>
          </div>

          {/* 3-step pickup flow */}
          <ol className="space-y-3">
            {[
              { icon: ShoppingCart, title: "Add to cart", sub: "Browse the full catalog and build your order in seconds." },
              { icon: CreditCard, title: "Reserve & pay", sub: "Secure checkout with Clover locks in your stock." },
              { icon: MapPin, title: "Pick up at the tent", sub: "Show your order number in Republic, MO — skip the line." },
            ].map((s, i) => (
              <li key={s.title} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-usared text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <s.icon className="h-4 w-4 text-usablue" /> {s.title}
                  </div>
                  <p className="text-sm text-slate-500">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <SectionHead eyebrow="Browse" title="Shop by category" href="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?categoryId=${c.id}`}
              className="card-lite card-hover flex flex-col items-center gap-2 px-3 py-5 text-center"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-sm font-semibold text-slate-800">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section id="featured">
          <SectionHead eyebrow="Hand-picked" title="Featured fireworks" href="/shop" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS */}
      <section>
        <SectionHead eyebrow="The catalog" title="Best sellers" href="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            See all fireworks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      <Link
        href={href}
        className="hidden items-center gap-1 text-sm font-semibold text-usablue hover:text-usared sm:flex"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
