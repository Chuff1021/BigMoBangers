"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WebScanner } from "@/components/staff/web-scanner";

interface ScannedProduct {
  id: string;
  name: string;
  price: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  streamVideoId: string | null;
  category: { name: string; emoji: string } | null;
}

function videoEmbed(url: string | null): { src: string; kind: "iframe" | "video" } | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  )?.[1];
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`, kind: "iframe" };
  const vm = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vm) return { src: `https://player.vimeo.com/video/${vm}?autoplay=1`, kind: "iframe" };
  if (/\.mp4(?:\?|$)/i.test(url)) return { src: url, kind: "video" };
  return null;
}

export default function StaffScan() {
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);

  async function onScan(code: string) {
    setLoading(true);
    setNotFound(null);
    try {
      const res = await fetch(
        `/api/products/scan?tenant=bigmos&code=${encodeURIComponent(code)}`,
        { cache: "no-store" }
      );
      if (res.ok) setProduct(await res.json());
      else setNotFound(code);
    } catch {
      setNotFound(code);
    } finally {
      setLoading(false);
    }
  }

  if (product) {
    const video = videoEmbed(product.youtubeUrl);
    return (
      <div className="px-4 py-4">
        <button onClick={() => setProduct(null)} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Scan another
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex aspect-square items-center justify-center bg-slate-50 p-6">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <span className="text-7xl">🎆</span>
            )}
          </div>
          <div className="p-4">
            {product.category && (
              <div className="text-xs font-bold uppercase tracking-wide text-usablue">
                {product.category.emoji} {product.category.name}
              </div>
            )}
            <h1 className="mt-1 text-2xl font-extrabold">{product.name}</h1>
            <div className="text-2xl font-extrabold">${Number(product.price).toFixed(2)}</div>
            {(product.barcode || product.sku) && (
              <div className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                Scan code: {product.barcode || product.sku}
              </div>
            )}
          </div>
        </div>

        {video ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
            <div className="aspect-video w-full">
              {video.kind === "iframe" ? (
                <iframe
                  className="h-full w-full"
                  src={video.src}
                  title="Product video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video className="h-full w-full" controls autoPlay playsInline src={video.src} />
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-slate-200 p-4 text-center text-sm text-slate-500">
            No video available for this product.
          </div>
        )}

        {product.description && (
          <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <Link href="/staff" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Staff
      </Link>
      <WebScanner onScan={onScan} active={!loading} />
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Looking up…
        </div>
      )}
      {notFound && (
        <div className="mt-4 rounded-xl bg-usared px-4 py-3 text-center text-sm font-semibold text-white">
          No product for {notFound}
        </div>
      )}
    </div>
  );
}
