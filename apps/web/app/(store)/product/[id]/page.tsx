import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "@/lib/store";
import { AddToCartPanel } from "@/components/store/add-to-cart-panel";

export const dynamic = "force-dynamic";

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const out = product.trackInventory && product.inventoryQty <= 0;
  const low =
    product.trackInventory &&
    product.inventoryQty > 0 &&
    product.inventoryQty <= product.lowStockThreshold;
  const yt = product.youtubeUrl ? youtubeId(product.youtubeUrl) : null;

  return (
    <div className="space-y-6">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-electric"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Media */}
        <div className="space-y-4">
          <div className="ring-anim rounded-3xl">
            <div className="glass flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-navy/40 to-black/40">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[8rem] drop-shadow-[0_0_30px_rgba(255,59,48,0.5)]">
                  {product.category?.emoji ?? "🎆"}
                </span>
              )}
            </div>
          </div>
          {yt && (
            <div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${yt}`}
                title="Product video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <span className="glass inline-block rounded-full px-3 py-1 text-xs font-semibold text-white">
              {product.category.emoji} {product.category.name}
            </span>
          )}
          <h1 className="font-display text-4xl leading-none tracking-wide text-white sm:text-5xl">
            {product.name}
          </h1>
          <div className="font-display text-5xl tracking-wide text-gold">
            ${Number(product.price).toFixed(2)}
          </div>

          <div>
            {out ? (
              <span className="text-sm font-bold uppercase tracking-wider text-brand">Out of stock</span>
            ) : low ? (
              <span className="text-sm font-bold uppercase tracking-wider text-gold">
                Only {product.inventoryQty} left — grab &apos;em!
              </span>
            ) : (
              <span className="text-sm font-bold uppercase tracking-wider text-electric">In stock</span>
            )}
          </div>

          {product.description && (
            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <AddToCartPanel
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              emoji: product.category?.emoji,
              outOfStock: out,
            }}
          />
        </div>
      </div>
    </div>
  );
}
