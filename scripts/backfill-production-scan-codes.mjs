#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const base = process.argv.find((arg) => arg.startsWith("--base="))?.slice("--base=".length) ??
  "https://big-mo-bangers.vercel.app";
const catalogPath = process.argv.find((arg) => arg.startsWith("--catalog="))?.slice("--catalog=".length) ??
  "apps/web/lib/fireworks-supermarket-catalog.json";

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const bySource = new Map(catalog.map((row) => [row.sourceId, row]));
const byName = new Map(catalog.map((row) => [row.name.toLowerCase(), row]));

const productsRes = await fetch(`${base}/api/products?tenant=bigmos`);
if (!productsRes.ok) {
  throw new Error(`Could not load production products: ${productsRes.status} ${await productsRes.text()}`);
}

const products = await productsRes.json();
let updated = 0;
const failed = [];

for (const product of products) {
  const source =
    (product.tags ?? []).find((tag) => String(tag).startsWith("fwsm-")) ??
    (String(product.id).startsWith("fwsm-") ? product.id : null);
  const row = (source && bySource.get(source)) ?? byName.get(String(product.name).toLowerCase());

  if (!row) {
    failed.push({ name: product.name, error: "no catalog match" });
    continue;
  }

  const tags = Array.from(
    new Set(
      [
        ...(product.tags ?? []),
        row.sku,
        row.barcode,
        row.sourceId,
        row.supplierSku,
        row.sku ? `sku:${row.sku}` : null,
        row.barcode ? `barcode:${row.barcode}` : null,
        row.sourceId ? `source-id:${row.sourceId}` : null,
        "source:fireworks-supermarket",
      ].filter(Boolean)
    )
  );

  const res = await fetch(`${base}/api/products/${product.id}?tenant=bigmos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku: row.sku,
      barcode: row.barcode,
      tags,
    }),
  });

  if (!res.ok) {
    failed.push({
      name: product.name,
      status: res.status,
      text: (await res.text()).slice(0, 240),
    });
  } else {
    updated += 1;
    if (updated % 100 === 0) console.log(`updated ${updated}`);
  }
}

console.log(JSON.stringify({ products: products.length, updated, failedCount: failed.length, failed: failed.slice(0, 10) }, null, 2));
if (failed.length) process.exit(1);
