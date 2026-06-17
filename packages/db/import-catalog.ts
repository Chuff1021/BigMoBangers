/**
 * Bulk catalog importer for Big MO's Bangers.
 *
 *   pnpm import:catalog path/to/inventory.csv [--tenant bigmos] [--replace]
 *
 * Accepts a CSV (export your inventory list from Excel/Sheets as CSV). Headers
 * are matched case/space-insensitively, so most spreadsheets work as-is. Known
 * columns (any subset):
 *
 *   name | product | title              -> product name        (required)
 *   sku  | item     | code              -> stock keeping unit   (used to upsert)
 *   category | dept | type             -> category (auto-created)
 *   price | retail | msrp              -> sale price
 *   cost  | wholesale                  -> your cost (stored in tags as cost:NN)
 *   qty | quantity | stock | onhand    -> on-hand inventory
 *   image | imageurl | photo | picture -> primary image URL
 *   images                             -> extra image URLs (| or ; separated)
 *   video | youtube | youtubeurl       -> YouTube URL
 *   description | desc | details        -> description
 *   featured                           -> truthy => featured
 *
 * It UPSERTS by SKU (falls back to name) so re-running updates prices/stock
 * instead of duplicating. Every stock change is written to inventory_changes,
 * so "true stock" stays auditable.
 */
import { readFileSync } from "node:fs";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./client";
import {
  tenants,
  categories,
  products,
  inventoryChanges,
  type Product,
} from "./schema";

// ---- tiny CSV parser (handles quoted fields, commas, newlines) ----------
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ""));
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
}

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) if (row[k]) return row[k];
  return "";
}

function toMoney(v: string): string | null {
  const n = Number(v.replace(/[$,]/g, ""));
  return Number.isFinite(n) && v.trim() !== "" ? n.toFixed(2) : null;
}

function truthy(v: string): boolean {
  return /^(1|true|yes|y|x)$/i.test(v.trim());
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const tenantSlug =
    args.find((a) => a.startsWith("--tenant="))?.split("=")[1] ??
    (args.includes("--tenant") ? args[args.indexOf("--tenant") + 1] : "bigmos");

  if (!file) {
    console.error("Usage: pnpm import:catalog <file.csv> [--tenant bigmos]");
    process.exit(1);
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });
  if (!tenant) {
    console.error(`Tenant "${tenantSlug}" not found. Seed it first (pnpm db:seed).`);
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(file, "utf8"));
  console.log(`Parsed ${rows.length} rows from ${file}`);

  // Cache existing categories by lowercased name.
  const existingCats = await db.query.categories.findMany({
    where: eq(categories.tenantId, tenant.id),
  });
  const catByName = new Map(existingCats.map((c) => [c.name.toLowerCase(), c]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = pick(row, ["name", "product", "title", "productname"]);
    if (!name) {
      skipped++;
      continue;
    }
    const sku = pick(row, ["sku", "item", "itemnumber", "code", "itemcode"]);
    const categoryName = pick(row, ["category", "dept", "department", "type"]);
    const price = toMoney(pick(row, ["price", "retail", "retailprice", "msrp"])) ?? "0.00";
    const cost = toMoney(pick(row, ["cost", "wholesale", "wholesaleprice"]));
    const qtyRaw = pick(row, ["qty", "quantity", "stock", "onhand", "inventory"]);
    const qty = qtyRaw === "" ? 0 : Math.max(0, Math.round(Number(qtyRaw.replace(/[^0-9.-]/g, "")) || 0));
    const imageUrl = pick(row, ["image", "imageurl", "photo", "picture", "img"]) || null;
    const extraImages = pick(row, ["images", "gallery"])
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const youtubeUrl = pick(row, ["video", "youtube", "youtubeurl", "videourl"]) || null;
    const description = pick(row, ["description", "desc", "details"]) || null;
    const isFeatured = truthy(pick(row, ["featured", "feature"]));

    // Ensure category.
    let categoryId: string | null = null;
    if (categoryName) {
      const key = categoryName.toLowerCase();
      let cat = catByName.get(key);
      if (!cat) {
        const [row2] = await db
          .insert(categories)
          .values({ tenantId: tenant.id, name: categoryName, sortOrder: catByName.size + 1 })
          .returning();
        cat = row2;
        catByName.set(key, cat);
      }
      categoryId = cat.id;
    }

    const tags = [
      ...(sku ? [`sku:${sku}`] : []),
      ...(cost ? [`cost:${cost}`] : []),
    ];

    // Find existing by SKU (in tags) or by exact name.
    let existing: Product | undefined;
    if (sku) {
      existing = await db.query.products.findFirst({
        where: and(
          eq(products.tenantId, tenant.id),
          sql`${products.tags} @> ${JSON.stringify([`sku:${sku}`])}::jsonb`
        ),
      });
    }
    if (!existing) {
      existing = await db.query.products.findFirst({
        where: and(eq(products.tenantId, tenant.id), eq(products.name, name)),
      });
    }

    if (existing) {
      const delta = qty - existing.inventoryQty;
      await db
        .update(products)
        .set({
          categoryId: categoryId ?? existing.categoryId,
          description: description ?? existing.description,
          price,
          imageUrl: imageUrl ?? existing.imageUrl,
          images: extraImages.length ? extraImages : existing.images,
          youtubeUrl: youtubeUrl ?? existing.youtubeUrl,
          inventoryQty: qty,
          isFeatured: isFeatured || existing.isFeatured,
          tags: tags.length ? tags : existing.tags,
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id));
      if (delta !== 0) {
        await db.insert(inventoryChanges).values({
          tenantId: tenant.id,
          productId: existing.id,
          qtyChange: delta,
          reason: "restock",
          note: `Import sync (${sku || name})`,
        });
      }
      updated++;
    } else {
      const [p] = await db
        .insert(products)
        .values({
          tenantId: tenant.id,
          categoryId,
          name,
          description,
          price,
          imageUrl,
          images: extraImages,
          youtubeUrl,
          inventoryQty: qty,
          isFeatured,
          tags,
        })
        .returning();
      if (qty > 0) {
        await db.insert(inventoryChanges).values({
          tenantId: tenant.id,
          productId: p.id,
          qtyChange: qty,
          reason: "restock",
          note: `Initial import (${sku || name})`,
        });
      }
      created++;
    }
  }

  console.log(
    `✅ Import complete — ${created} created, ${updated} updated, ${skipped} skipped (no name).`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
