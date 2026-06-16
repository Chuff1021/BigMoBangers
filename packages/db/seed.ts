import { db } from "./client";
import { tenants, categories, products } from "./schema";

async function seed() {
  // Insert Big MO's Bangers tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      businessName: "Big MO's Bangers",
      slug: "bigmos",
      phone: "417-555-0100",
      address: "123 Main St",
      city: "Republic",
      state: "MO",
      zip: "65738",
      primaryColor: "#FF4500",
      timezone: "America/Chicago",
    })
    .returning();

  // Insert categories
  const cats = await db
    .insert(categories)
    .values([
      { tenantId: tenant.id, name: "Aerials", emoji: "🎆", sortOrder: 1 },
      { tenantId: tenant.id, name: "Fountains", emoji: "⛲", sortOrder: 2 },
      { tenantId: tenant.id, name: "500g Cakes", emoji: "🎂", sortOrder: 3 },
      { tenantId: tenant.id, name: "Sparklers", emoji: "✨", sortOrder: 4 },
      { tenantId: tenant.id, name: "Assortments", emoji: "🎁", sortOrder: 5 },
      { tenantId: tenant.id, name: "Novelties", emoji: "🎉", sortOrder: 6 },
    ])
    .returning();

  // Insert 10 sample products
  await db.insert(products).values([
    { tenantId: tenant.id, categoryId: cats[0].id, name: "Red Titan Aerial", description: "200 shot red chrysanthemum with gold glitter", price: "49.99", inventoryQty: 24, isFeatured: true },
    { tenantId: tenant.id, categoryId: cats[2].id, name: "Missouri Monster 500g Cake", description: "100 shot fan cake with color crossettes", price: "79.99", inventoryQty: 12, isFeatured: true },
    { tenantId: tenant.id, categoryId: cats[1].id, name: "Gold Glitter Fountain", description: "90 second gold glitter fountain", price: "14.99", inventoryQty: 48 },
    { tenantId: tenant.id, categoryId: cats[0].id, name: "Blue Thunder Aerial", description: "36 shot blue peony with silver tail", price: "34.99", inventoryQty: 18 },
    { tenantId: tenant.id, categoryId: cats[3].id, name: 'Jumbo Sparklers 36"', description: "Pack of 12 jumbo gold sparklers", price: "8.99", inventoryQty: 100 },
    { tenantId: tenant.id, categoryId: cats[4].id, name: "Family Fun Assortment", description: "50 piece family assortment — fountains, sparklers, and poppers", price: "29.99", inventoryQty: 30, isFeatured: true },
    { tenantId: tenant.id, categoryId: cats[2].id, name: "Patriot Pride 500g", description: "Red, white, and blue 120 shot fan cake", price: "89.99", inventoryQty: 8 },
    { tenantId: tenant.id, categoryId: cats[1].id, name: "Purple Rain Fountain", description: "60 second purple and silver fountain", price: "12.99", inventoryQty: 36 },
    { tenantId: tenant.id, categoryId: cats[5].id, name: "Snap Pops Bag", description: "50 count snap pop bag", price: "3.99", inventoryQty: 200, trackInventory: false },
    { tenantId: tenant.id, categoryId: cats[0].id, name: "Galaxy Buster 500 Shot", description: "500 shot multi-color aerial finale", price: "129.99", inventoryQty: 6, isFeatured: true },
  ]);

  console.log("✅ Seed complete — Big MO's Bangers is ready");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
