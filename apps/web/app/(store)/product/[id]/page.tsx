import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
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
  const gallery = [product.imageUrl, ...product.images].filter(
    (src, idx, arr): src is string => Boolean(src) && arr.indexOf(src) === idx
  );

  return (
    <div className="space-y-6">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-usared"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Media */}
        <div className="space-y-3">
          <div className="card-lite flex aspect-square items-center justify-center overflow-hidden p-6">
            {gallery[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[0]} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <span className="text-[8rem]">{product.category?.emoji ?? "🎆"}</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.slice(1, 5).map((src, index) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="card-lite block aspect-square overflow-hidden p-1.5"
                  aria-label={`Open ${product.name} photo ${index + 2}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-contain" />
                </a>
              ))}
            </div>
          )}
          {yt && (
            <div className="card-lite aspect-video overflow-hidden p-0">
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
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-usablue">
              {product.category.emoji} {product.category.name}
            </span>
          )}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="text-4xl font-bold tracking-tight text-slate-900">
            ${Number(product.price).toFixed(2)}
          </div>

          <div>
            {out ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <AlertTriangle className="h-4 w-4" /> Out of stock
              </span>
            ) : low ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                <AlertTriangle className="h-4 w-4" /> Only {product.inventoryQty} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> In stock
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-base leading-relaxed text-slate-600">{product.description}</p>
          )}

          <div className="card-lite p-4">
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
    </div>
  );
}
