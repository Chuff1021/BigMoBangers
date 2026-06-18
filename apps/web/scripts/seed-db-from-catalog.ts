/**
 * Load the storefront catalog (apps/web/lib/demo.ts → fireworks-supermarket
 * catalog) into the live Neon database for the bigmos tenant, so the products,
 * photos, and videos persist and the DB becomes the source of truth.
 *
 *   DATABASE_URL=... pnpm --filter @bangers/web exec tsx scripts/seed-db-from-catalog.ts
 *
 * Idempotent: clears the tenant's existing categories + products first.
 */
import { db, tenants, categories, products } from "@bangers/db";
import { eq } from "drizzle-orm";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "../lib/demo";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, "bigmos"),
  });
  if (!tenant) throw new Error("Tenant 'bigmos' not found — run pnpm db:seed first.");

  // Clean slate for a faithful reload.
  await db.delete(products).where(eq(products.tenantId, tenant.id));
  await db.delete(categories).where(eq(categories.tenantId, tenant.id));

  // Categories → new UUIDs, mapped by name.
  const insertedCats = await db
    .insert(categories)
    .values(
      DEMO_CATEGORIES.map((c) => ({
        tenantId: tenant.id,
        name: c.name,
        emoji: c.emoji,
        sortOrder: c.sortOrder,
      }))
    )
    .returning();
  const catIdByName = new Map(insertedCats.map((c) => [c.name, c.id]));
  console.log(`Inserted ${insertedCats.length} categories`);

  // Map demo categoryId → category name → new UUID.
  const demoCatName = new Map(DEMO_CATEGORIES.map((c) => [c.id, c.name]));

  const rows = DEMO_PRODUCTS.map((p) => {
    const name = p.categoryId ? demoCatName.get(p.categoryId) : undefined;
    const categoryId = name ? catIdByName.get(name) ?? null : null;
    return {
      tenantId: tenant.id,
      categoryId,
      name: p.name,
      description: p.description || null,
      sku: p.sku,
      barcode: p.barcode,
      price: p.price,
      imageUrl: p.imageUrl,
      images: p.images ?? [],
      youtubeUrl: p.youtubeUrl,
      streamVideoId: p.streamVideoId,
      inventoryQty: p.inventoryQty,
      lowStockThreshold: p.lowStockThreshold,
      trackInventory: p.trackInventory,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      tags: p.tags ?? [],
    };
  });

  let inserted = 0;
  for (const batch of chunk(rows, 100)) {
    await db.insert(products).values(batch);
    inserted += batch.length;
    console.log(`  …${inserted}/${rows.length} products`);
  }

  console.log(`✅ Loaded ${inserted} products into the database.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
