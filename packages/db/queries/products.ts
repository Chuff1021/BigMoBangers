import { and, eq, ilike, desc, sql } from "drizzle-orm";
import { db } from "../client";
import {
  products,
  inventoryChanges,
  type NewProduct,
  type InventoryReason,
} from "../schema";

export interface ProductFilters {
  categoryId?: string;
  isFeatured?: boolean;
  search?: string;
  includeInactive?: boolean;
}

export async function getProducts(tenantId: string, filters: ProductFilters = {}) {
  const conditions = [eq(products.tenantId, tenantId)];

  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (typeof filters.isFeatured === "boolean") {
    conditions.push(eq(products.isFeatured, filters.isFeatured));
  }
  if (filters.search) {
    conditions.push(ilike(products.name, `%${filters.search}%`));
  }
  if (!filters.includeInactive) {
    conditions.push(eq(products.isActive, true));
  }

  return db.query.products.findMany({
    where: and(...conditions),
    with: { category: true },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
  });
}

export async function getProductById(tenantId: string, productId: string) {
  const result = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.tenantId, tenantId)),
    with: { category: true },
  });
  return result ?? null;
}

export async function createProduct(
  tenantId: string,
  data: Omit<NewProduct, "tenantId" | "id">
) {
  const [row] = await db
    .insert(products)
    .values({ ...data, tenantId })
    .returning();
  return row;
}

export async function updateProduct(
  tenantId: string,
  productId: string,
  data: Partial<Omit<NewProduct, "tenantId" | "id">>
) {
  const [row] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
    .returning();
  return row ?? null;
}

export async function deleteProduct(tenantId: string, productId: string) {
  const [row] = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
    .returning();
  return row ?? null;
}

/**
 * Adjust a product's on-hand inventory and write an audit row in one transaction.
 * `qtyChange` may be positive (add stock) or negative (remove / sale).
 */
export async function adjustInventory(
  tenantId: string,
  productId: string,
  qtyChange: number,
  reason: InventoryReason,
  orderId?: string,
  note?: string
) {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(products)
      .set({
        inventoryQty: sql`${products.inventoryQty} + ${qtyChange}`,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .returning();

    if (!updated) {
      throw new Error(`Product ${productId} not found for tenant ${tenantId}`);
    }

    await tx.insert(inventoryChanges).values({
      tenantId,
      productId,
      qtyChange,
      reason,
      note,
      orderId,
    });

    return updated;
  });
}
