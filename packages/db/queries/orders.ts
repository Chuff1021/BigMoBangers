import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { db } from "../client";
import {
  orders,
  orderItems,
  products,
  inventoryChanges,
  customers,
  type OrderStatus,
  type PaymentStatus,
} from "../schema";

export interface CreateOrderData {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pickupNote?: string;
  items: { productId: string; quantity: number }[];
  /** Tax rate as a decimal, e.g. 0.0825. Defaults to the tenant's configured rate. */
  taxRate?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  stripePaymentIntentId?: string;
}

export interface OrderFilters {
  status?: string;
}

function money(n: number): string {
  return n.toFixed(2);
}

/**
 * Create an order + its line items in a single transaction. For every item we
 * decrement the product's inventory (when tracked) and write an inventory_changes
 * audit row. Totals are computed server-side from live product prices.
 */
export async function createOrder(tenantId: string, data: CreateOrderData) {
  return db.transaction(async (tx) => {
    const productIds = data.items.map((i) => i.productId);
    if (productIds.length === 0) {
      throw new Error("Cannot create an order with no items");
    }

    const rows = await tx
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), inArray(products.id, productIds)));

    const byId = new Map(rows.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemValues = data.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found for tenant ${tenantId}`);
      }
      const unit = Number(product.price);
      const lineTotal = unit * item.quantity;
      subtotal += lineTotal;
      return {
        product,
        quantity: item.quantity,
        unitPrice: money(unit),
        lineTotal: money(lineTotal),
      };
    });

    const taxRate = data.taxRate ?? 0.0825;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Resolve/attach a customer record when we have contact info.
    let customerId: string | undefined;
    if (data.customerPhone || data.customerEmail) {
      const existing = data.customerPhone
        ? await tx.query.customers.findFirst({
            where: and(
              eq(customers.tenantId, tenantId),
              eq(customers.phone, data.customerPhone)
            ),
          })
        : null;
      if (existing) {
        customerId = existing.id;
      } else {
        const [c] = await tx
          .insert(customers)
          .values({
            tenantId,
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
          })
          .returning();
        customerId = c.id;
      }
    }

    // Human-readable order number, scoped per tenant.
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.tenantId, tenantId));
    const orderNumber = `BM-${1000 + Number(count) + 1}`;

    const [order] = await tx
      .insert(orders)
      .values({
        tenantId,
        customerId,
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        pickupNote: data.pickupNote,
        status: data.status ?? "pending",
        paymentStatus: data.paymentStatus ?? "unpaid",
        subtotal: money(subtotal),
        tax: money(tax),
        total: money(total),
        stripePaymentIntentId: data.stripePaymentIntentId,
      })
      .returning();

    await tx.insert(orderItems).values(
      itemValues.map((iv) => ({
        orderId: order.id,
        productId: iv.product.id,
        productName: iv.product.name,
        quantity: iv.quantity,
        unitPrice: iv.unitPrice,
        lineTotal: iv.lineTotal,
      }))
    );

    // Decrement inventory + audit for tracked products.
    for (const iv of itemValues) {
      if (!iv.product.trackInventory) continue;
      await tx
        .update(products)
        .set({
          inventoryQty: sql`${products.inventoryQty} - ${iv.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, iv.product.id));

      await tx.insert(inventoryChanges).values({
        tenantId,
        productId: iv.product.id,
        qtyChange: -iv.quantity,
        reason: "sale",
        orderId: order.id,
      });
    }

    return { ...order, items: itemValues.map((iv) => iv) };
  });
}

export async function getOrders(tenantId: string, filters: OrderFilters = {}) {
  const conditions = [eq(orders.tenantId, tenantId)];
  if (filters.status) {
    conditions.push(eq(orders.status, filters.status as OrderStatus));
  }
  return db.query.orders.findMany({
    where: and(...conditions),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });
}

/** Public storefront lookup: a customer finds their orders by phone number. */
export async function getOrdersByPhone(tenantId: string, phone: string) {
  return db.query.orders.findMany({
    where: and(eq(orders.tenantId, tenantId), eq(orders.customerPhone, phone)),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });
}

export async function getOrderById(tenantId: string, orderId: string) {
  const result = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)),
    with: { items: true, customer: true },
  });
  return result ?? null;
}

export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  status: OrderStatus
) {
  const [row] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
    .returning();
  return row ?? null;
}
