#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const API = "https://fireworkssupermarket.com/wp-json/wc/store/v1/products";
const perPage = Number(arg("--per-page") ?? 100);
const maxPages = Number(arg("--max-pages") ?? 100);
const defaultQty = Number(arg("--default-qty") ?? 999);
const concurrency = Number(arg("--concurrency") ?? 4);
const includeVideos = arg("--skip-videos") === null;
const output = arg("--output") ?? "packages/db/fireworks-supermarket-catalog.csv";

function arg(name) {
  const hit = process.argv.find((a) => a === name || a.startsWith(`${name}=`));
  if (!hit) return null;
  if (hit.includes("=")) return hit.split("=").slice(1).join("=");
  return process.argv[process.argv.indexOf(hit) + 1] ?? null;
}

function stripHtml(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8243;/g, '"')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function money(product) {
  const raw = Number(product.prices?.price ?? 0);
  const places = Number(product.prices?.currency_minor_unit ?? 2);
  return (raw / 10 ** places).toFixed(2);
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeVideoUrl(raw = "") {
  const value = decodeHtml(raw).trim();
  if (!value) return "";

  const withProtocol = value.startsWith("//") ? `https:${value}` : value;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/watch?v=${id}` : "";
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id =
        url.searchParams.get("v") ??
        url.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/)?.[1];
      return id ? `https://www.youtube.com/watch?v=${id}` : "";
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    if (url.pathname.toLowerCase().endsWith(".mp4")) {
      return url.toString();
    }
  } catch {
    // Keep going; regex fallbacks below catch partial iframe snippets.
  }

  const youtubeId = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)?.[1];
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;

  const vimeoId = value.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;

  return "";
}

function videoUrlFromHtml(html = "") {
  const decoded = decodeHtml(html);
  const candidates = [
    ...decoded.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi),
    ...decoded.matchAll(/(?:data-video-url|data-src|src)=["']([^"']+)["']/gi),
    ...decoded.matchAll(/href=["']([^"']*(?:youtube\.com|youtu\.be|vimeo\.com|\.mp4)[^"']*)["']/gi),
    ...decoded.matchAll(/https?:\/\/[^\s"'<>]+(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com|\.mp4)[^\s"'<>]*/gi),
  ];

  for (const match of candidates) {
    const url = normalizeVideoUrl(match[1] ?? match[0]);
    if (url) return url;
  }
  return "";
}

async function productPageVideo(product) {
  const apiVideo = videoUrlFromHtml(
    `${product.description ?? ""} ${product.short_description ?? ""} ${JSON.stringify(product.extensions ?? {})}`,
  );
  if (apiVideo || !includeVideos || !product.permalink) return apiVideo;

  try {
    const res = await fetch(product.permalink, {
      headers: {
        accept: "text/html",
        "user-agent": "BigMoBangers catalog sync (+https://bigmobangers.com)",
      },
    });
    if (!res.ok) {
      console.warn(`Video crawl skipped ${product.permalink}: HTTP ${res.status}`);
      return "";
    }
    return videoUrlFromHtml(await res.text());
  } catch (error) {
    console.warn(`Video crawl failed ${product.permalink}: ${error.message}`);
    return "";
  }
}

async function getPage(page) {
  const url = new URL(API);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fireworks Supermarket API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, limit) }, worker));
  return results;
}

const products = [];
for (let page = 1; page <= maxPages; page++) {
  const pageProducts = await getPage(page);
  if (!Array.isArray(pageProducts) || pageProducts.length === 0) break;

  products.push(...pageProducts);
  console.log(`Fetched page ${page}: ${pageProducts.length} products`);
  if (pageProducts.length < perPage) break;
}

let videoCount = 0;
const rows = await mapLimit(products, concurrency, async (product, index) => {
    const images = (product.images ?? []).map((img) => img.src).filter(Boolean);
    const video = await productPageVideo(product);
    if (video) videoCount += 1;
    if ((index + 1) % 100 === 0 || index + 1 === products.length) {
      console.log(`Prepared ${index + 1}/${products.length} products (${videoCount} videos)`);
    }
    return {
      name: stripHtml(product.name),
      sku: `fwsm-${product.id}`,
      category: product.categories?.[0]?.name ?? "",
      price: money(product),
      qty: defaultQty,
      image: images[0] ?? "",
      images: images.slice(1).join("|"),
      video,
      description: stripHtml(product.description || product.short_description),
      featured: product.is_featured ? "yes" : "",
    };
});

const headers = [
  "name",
  "sku",
  "category",
  "price",
  "qty",
  "image",
  "images",
  "video",
  "description",
  "featured",
];

const text = [
  headers.join(","),
  ...rows.map((row) => headers.map((key) => csv(row[key])).join(",")),
].join("\n");

await writeFile(output, `${text}\n`);
console.log(`Wrote ${rows.length} products (${videoCount} videos) to ${output}`);
