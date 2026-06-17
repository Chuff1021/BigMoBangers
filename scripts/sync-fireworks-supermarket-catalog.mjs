#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const API = "https://fireworkssupermarket.com/wp-json/wc/store/v1/products";
const perPage = Number(arg("--per-page") ?? 100);
const maxPages = Number(arg("--max-pages") ?? 100);
const defaultQty = Number(arg("--default-qty") ?? 999);
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

function youtubeUrl(product) {
  const html = `${product.description ?? ""} ${product.short_description ?? ""}`;
  return (
    html.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s"'<>]+/i)?.[0] ??
    ""
  );
}

async function getPage(page) {
  const url = new URL(API);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fireworks Supermarket API ${res.status}: ${await res.text()}`);
  return res.json();
}

const rows = [];
for (let page = 1; page <= maxPages; page++) {
  const products = await getPage(page);
  if (!Array.isArray(products) || products.length === 0) break;

  for (const product of products) {
    const images = (product.images ?? []).map((img) => img.src).filter(Boolean);
    rows.push({
      name: stripHtml(product.name),
      sku: `fwsm-${product.id}`,
      category: product.categories?.[0]?.name ?? "",
      price: money(product),
      qty: defaultQty,
      image: images[0] ?? "",
      images: images.slice(1).join("|"),
      video: youtubeUrl(product),
      description: stripHtml(product.description || product.short_description),
      featured: product.is_featured ? "yes" : "",
    });
  }

  console.log(`Fetched page ${page}: ${products.length} products`);
  if (products.length < perPage) break;
}

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
console.log(`Wrote ${rows.length} products to ${output}`);
