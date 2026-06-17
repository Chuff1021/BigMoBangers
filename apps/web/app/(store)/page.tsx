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

/**
 * Realistic glowing firework burst built from radiating spark particles +
 * fading trails, with an SVG glow filter and screen blend. Reads as a real
 * firework, not clipart.
 */
function FireworkBurst({
  id,
  color,
  className,
  style,
}: {
  id: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const rays = 30;
  const trails: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  const sparks: { x: number; y: number; r: number; o: number }[] = [];
  const radii = [22, 30, 38, 45, 50];
  for (let i = 0; i < rays; i++) {
    const a = (i * 2 * Math.PI) / rays + (i % 2 ? 0.05 : 0);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    trails.push({
      x1: 60 + cos * 8,
      y1: 60 + sin * 8,
      x2: 60 + cos * 46,
      y2: 60 + sin * 46,
      w: i % 3 === 0 ? 1.1 : 0.7,
    });
    radii.forEach((rr, j) => {
      sparks.push({
        x: 60 + cos * rr,
        y: 60 + sin * rr,
        r: 1.5 - j * 0.12,
        o: 0.45 + j * 0.13,
      });
    });
  }
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <defs>
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`trail-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g filter={`url(#glow-${id})`}>
        {trails.map((t, k) => (
          <line
            key={`t${k}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={color}
            strokeWidth={t.w}
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
        ))}
        {sparks.map((s, k) => (
          <circle key={`s${k}`} cx={s.x} cy={s.y} r={Math.max(0.55, s.r)} fill={color} opacity={Math.min(1, s.o)} />
        ))}
        <circle cx="60" cy="60" r="3" fill="#ffffff" />
        <circle cx="60" cy="60" r="6" fill={color} opacity="0.5" />
      </g>
    </svg>
  );
}

const STARS = [
  { x: 8, y: 18, s: 2, d: 0 }, { x: 18, y: 40, s: 1.5, d: 0.6 }, { x: 14, y: 64, s: 2, d: 1.2 },
  { x: 27, y: 14, s: 1.5, d: 0.3 }, { x: 33, y: 70, s: 2, d: 1.6 }, { x: 44, y: 10, s: 1.5, d: 0.9 },
  { x: 56, y: 16, s: 2, d: 0.2 }, { x: 64, y: 64, s: 1.5, d: 1.1 }, { x: 72, y: 22, s: 2, d: 0.5 },
  { x: 80, y: 50, s: 1.5, d: 1.4 }, { x: 86, y: 30, s: 2, d: 0.8 }, { x: 92, y: 60, s: 1.5, d: 0.4 },
  { x: 50, y: 80, s: 1.5, d: 1.0 }, { x: 38, y: 28, s: 1.5, d: 1.7 }, { x: 68, y: 82, s: 2, d: 0.7 },
  { x: 24, y: 86, s: 1.5, d: 1.3 }, { x: 60, y: 36, s: 1.2, d: 0.5 }, { x: 12, y: 50, s: 1.2, d: 1.5 },
];

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
      <section className="relative -mx-4 overflow-hidden border-y border-white/10 sm:mx-0 sm:rounded-3xl sm:border">
        {/* Night sky base + glows */}
        <div className="night-sky absolute inset-0" />

        {/* Soft drifting bokeh for depth */}
        <div className="pointer-events-none absolute inset-0 mix-blend-screen">
          <span className="drift absolute left-[12%] top-[20%] h-40 w-40 rounded-full bg-usared/40 blur-3xl" />
          <span className="drift-slow absolute right-[14%] top-[16%] h-44 w-44 rounded-full bg-usabright/40 blur-3xl" />
          <span className="drift absolute bottom-[10%] left-[40%] h-48 w-48 rounded-full bg-gold/25 blur-3xl" style={{ animationDelay: "2s" }} />
          <span className="drift-slow absolute bottom-[18%] right-[28%] h-36 w-36 rounded-full bg-usablue/45 blur-3xl" />
        </div>

        {/* Stars */}
        <div className="pointer-events-none absolute inset-0">
          {STARS.map((st, i) => (
            <span
              key={i}
              className="twinkle absolute rounded-full bg-white"
              style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }}
            />
          ))}
        </div>

        {/* Fireworks (screen-blended glow) */}
        <div className="pointer-events-none absolute inset-0 mix-blend-screen">
          <FireworkBurst id="a" color="#ff5a4d" className="burst absolute left-[2%] top-[6%] h-44 w-44 sm:h-60 sm:w-60" />
          <FireworkBurst id="b" color="#5aa0ff" className="burst absolute right-[1%] top-[10%] h-40 w-40 sm:h-56 sm:w-56" style={{ animationDelay: "1.2s" }} />
          <FireworkBurst id="c" color="#ffd23f" className="burst absolute bottom-[6%] left-[16%] hidden h-32 w-32 sm:block" style={{ animationDelay: "2.1s" }} />
          <FireworkBurst id="d" color="#ffffff" className="burst absolute bottom-[12%] right-[14%] hidden h-28 w-28 sm:block" style={{ animationDelay: "0.6s" }} />
          <FireworkBurst id="e" color="#ff8fb0" className="burst absolute left-[44%] top-[2%] hidden h-24 w-24 lg:block" style={{ animationDelay: "1.7s" }} />
        </div>

        {/* Vignette for text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgba(5,8,20,0.6)_100%)]" />

        <div className="usa-stripe absolute inset-x-0 top-0 z-10 h-1.5" />

        {/* Content */}
        <div className="relative z-10 px-5 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <span className="gold-foil inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide shadow-[0_8px_30px_-6px_rgba(255,210,63,0.6)] sm:text-sm">
              <Star className="h-3.5 w-3.5" fill="currentColor" /> 1776–2026 · America&apos;s 250th Birthday
              <Star className="h-3.5 w-3.5" fill="currentColor" />
            </span>

            {/* Logo with a glow halo */}
            <div className="relative mx-auto mt-7 w-full max-w-3xl">
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(120,160,255,0.45),transparent)] blur-2xl" />
              <Image
                src="/brand/logo.png"
                alt="Big MO's Bangers — Fireworks Tent"
                width={1290}
                height={689}
                priority
                className="relative w-full rounded-2xl shadow-[0_40px_90px_-25px_rgba(0,0,0,0.85)] ring-1 ring-white/15"
              />
            </div>

            <h1 className="mx-auto mt-9 max-w-2xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl">
              Make America&apos;s 250th the{" "}
              <span className="text-gold">biggest 4th yet.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              2026 marks 250 years of independence — celebrate with {products.length}+
              premium fireworks. Reserve online and pick up at the tent in Republic, MO.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-usared px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(200,16,46,0.8)] transition-all hover:bg-usared-dark hover:shadow-[0_14px_36px_-8px_rgba(200,16,46,0.9)]"
              >
                Shop fireworks <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                View featured
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Clover checkout</span>
              <span className="hidden h-3 w-px bg-white/20 sm:block" />
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-300" /> Reserve in seconds</span>
              <span className="hidden h-3 w-px bg-white/20 sm:block" />
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-300" fill="currentColor" /> Republic&apos;s favorite tent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 250TH CALLOUT BAND ===================== */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center sm:flex-row sm:text-left">
        <span className="gold-foil flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-sm">
          250
        </span>
        <div className="flex-1">
          <div className="text-sm font-extrabold uppercase tracking-wide text-amber-700">
            America&apos;s Semiquincentennial · July 4, 2026
          </div>
          <p className="text-sm text-amber-900/80">
            Two and a half centuries of independence call for the biggest show of your
            life. Reserve your stock early — the 250th 4th will sell out fast.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-usared px-5 py-2.5 text-sm font-semibold text-white hover:bg-usared-dark"
        >
          Stock up now <ArrowRight className="h-4 w-4" />
        </Link>
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
      <section className="night-sky relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
        <div className="usa-stripe absolute inset-x-0 top-0 h-1.5" />
        <div className="pointer-events-none absolute inset-0 mix-blend-screen">
          <FireworkBurst id="f1" color="#ffd23f" className="burst absolute left-[6%] top-[16%] hidden h-28 w-28 sm:block" />
          <FireworkBurst id="f2" color="#ff5a4d" className="burst absolute right-[8%] bottom-[12%] hidden h-28 w-28 sm:block" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="relative">
          <span className="gold-foil inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wide">
            <Star className="h-3.5 w-3.5" fill="currentColor" /> America&apos;s 250th · July 4, 2026
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready for the biggest 4th in 250 years?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-300">
            Reserve your fireworks now and skip the holiday rush. Boxed, paid, and
            waiting when you roll up to the tent.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-usared px-8 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            Shop all {products.length} fireworks <ArrowRight className="h-4 w-4" />
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
