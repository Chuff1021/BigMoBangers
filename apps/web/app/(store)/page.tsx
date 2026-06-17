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
  Star,
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
  const all = products.map(toStore).slice(0, 8);
  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    if (product.category?.id) {
      categoryCounts.set(product.category.id, (categoryCounts.get(product.category.id) ?? 0) + 1);
    }
  }
  const topCategories = [...categories]
    .sort((a, b) => (categoryCounts.get(b.id) ?? 0) - (categoryCounts.get(a.id) ?? 0))
    .slice(0, 9);

  return (
    <div className="space-y-16">
      {/* ============================ HERO ============================ */}
      <section className="relative -mx-4 overflow-hidden border-y border-slate-200 bg-white sm:mx-0 sm:rounded-3xl sm:border sm:shadow-sm">
        <div className="usa-stripe h-1.5 w-full" />
        <div className="lite-grid relative px-5 py-10 text-center sm:px-10 sm:py-16">
          {/* faint stars */}
          <Star className="pointer-events-none absolute left-[6%] top-[14%] hidden h-5 w-5 text-usablue/20 sm:block" fill="currentColor" />
          <Star className="pointer-events-none absolute right-[8%] top-[22%] hidden h-4 w-4 text-usared/20 sm:block" fill="currentColor" />
          <Star className="pointer-events-none absolute bottom-[18%] left-[12%] hidden h-3.5 w-3.5 text-usared/20 sm:block" fill="currentColor" />

          <div className="relative mx-auto max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-usablue shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-usared" /> Republic, MO · Order ahead for pickup
            </span>

            {/* The logo, big and dominant */}
            <div className="mx-auto mt-7 w-full max-w-3xl">
              <Image
                src="/brand/logo.png"
                alt="Big MO's Bangers — Fireworks Tent"
                width={1290}
                height={689}
                priority
                className="w-full rounded-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-200"
              />
            </div>

            <h1 className="mx-auto mt-9 max-w-2xl text-3xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
              Order ahead. Skip the line.{" "}
              <span className="text-usagrad">Light up the sky.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Shop {products.length}+ fireworks — aerials, 500‑gram cakes, and family
              packs at tent prices. Reserve online and pick up in Republic, MO.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-usared px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-usared-dark hover:shadow-md"
              >
                Shop fireworks <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                View featured
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure Clover checkout</span>
              <span className="hidden h-3 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-usablue" /> Reserve in seconds</span>
              <span className="hidden h-3 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" fill="currentColor" /> Republic&apos;s favorite tent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= TRUST BAR ========================= */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Sparkles, title: "Premium brands", sub: "Top-tier cakes & aerials" },
          { icon: ShieldCheck, title: "Low prices", sub: "Tent pricing, online ease" },
          { icon: Clock, title: "Reserve ahead", sub: "Lock in your stock" },
          { icon: Truck, title: "Fast pickup", sub: "Skip the line" },
        ].map((f) => (
          <div key={f.title} className="card-lite flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-usared ring-1 ring-slate-200">
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900">{f.title}</div>
              <div className="text-xs text-slate-500">{f.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ========================= FEATURED ========================= */}
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

      {/* ====================== SHOP BY CATEGORY ===================== */}
      <section>
        <SectionHead eyebrow="Browse" title="Shop by category" href="/shop" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?categoryId=${c.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-usared/40 hover:shadow-md"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-200">
                {c.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-slate-900">{c.name}</span>
                <span className="text-xs font-semibold text-slate-500">
                  {categoryCounts.get(c.id) ?? 0} products
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-usared" />
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-usablue hover:text-usared"
          >
            Browse all {categories.length} categories ({products.length} products){" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* =================== MOBILE ORDERING / PICKUP =================== */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
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

          <ol className="space-y-3">
            {[
              { icon: ShoppingCart, title: "Add to cart", sub: "Browse the full catalog and build your order in seconds." },
              { icon: CreditCard, title: "Reserve & pay", sub: "Secure checkout with Clover locks in your stock." },
              { icon: MapPin, title: "Pick up at the tent", sub: "Show your order number in Republic, MO — skip the line." },
            ].map((s, i) => (
              <li key={s.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-usared text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <s.icon className="h-4 w-4 text-usablue" /> {s.title}
                  </div>
                  <p className="text-sm text-slate-500">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========================= BEST SELLERS ========================= */}
      <section>
        <SectionHead eyebrow="The catalog" title="Popular right now" href="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ========================= FINAL CTA ========================= */}
      <section className="relative overflow-hidden rounded-3xl bg-usablue px-6 py-12 text-center sm:px-12 sm:py-14">
        <div className="usa-stripe absolute inset-x-0 top-0 h-1.5" />
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready for the big show?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-blue-100">
          Reserve your fireworks now and skip the holiday rush. Boxed, paid, and
          waiting when you roll up to the tent.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-usablue shadow-sm transition-transform hover:scale-[1.02]"
        >
          Shop all {products.length} fireworks <ArrowRight className="h-4 w-4" />
        </Link>
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
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
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
