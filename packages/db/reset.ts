/**
 * Wipe a tenant's catalog + transactional data so you can import a clean
 * inventory list. Keeps the tenant row itself.
 *
 *   pnpm db:reset --tenant bigmos --yes
 *
 * Requires --yes to run (destructive). Deletes in FK-safe order:
 *   inventory_changes → order_items → orders → products → categories → customers
 */
import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  tenants,
  categories,
  products,
  orders,
  orderItems,
  customers,
  inventoryChanges,
} from "./schema";

async function main() {
  const args = process.argv.slice(2);
  const tenantSlug =
    args.find((a) => a.startsWith("--tenant="))?.split("=")[1] ??
    (args.includes("--tenant") ? args[args.indexOf("--tenant") + 1] : "bigmos");
  const confirmed = args.includes("--yes");

  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, tenantSlug) });
  if (!tenant) {
    console.error(`Tenant "${tenantSlug}" not found.`);
    process.exit(1);
  }

  if (!confirmed) {
    console.error(
      `⚠️  This will DELETE all products, orders, customers, and categories for "${tenant.businessName}".\n` +
        `Re-run with --yes to confirm:\n\n    pnpm db:reset --tenant ${tenantSlug} --yes\n`
    );
    process.exit(1);
  }

  const tid = tenant.id;
  // order_items has no tenantId; delete via its orders. Easiest: clear in FK order.
  await db.delete(inventoryChanges).where(eq(inventoryChanges.tenantId, tid));
  const tenantOrders = await db.query.orders.findMany({ where: eq(orders.tenantId, tid) });
  for (const o of tenantOrders) {
    await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
  }
  await db.delete(orders).where(eq(orders.tenantId, tid));
  await db.delete(products).where(eq(products.tenantId, tid));
  await db.delete(categories).where(eq(categories.tenantId, tid));
  await db.delete(customers).where(eq(customers.tenantId, tid));

  console.log(`✅ Reset complete for "${tenant.businessName}" — ready to import.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
