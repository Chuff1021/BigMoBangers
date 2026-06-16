import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "../client";
import { customers, orders } from "../schema";

export interface UpsertCustomerData {
  name: string;
  phone?: string;
  email?: string;
}

/**
 * Find a customer by phone (within the tenant) or create a new one.
 * If no phone is supplied we always create — there is no stable key to match on.
 */
export async function upsertCustomer(tenantId: string, data: UpsertCustomerData) {
  if (data.phone) {
    const existing = await db.query.customers.findFirst({
      where: and(eq(customers.tenantId, tenantId), eq(customers.phone, data.phone)),
    });
    if (existing) {
      const [updated] = await db
        .update(customers)
        .set({
          name: data.name || existing.name,
          email: data.email ?? existing.email,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, existing.id))
        .returning();
      return updated;
    }
  }

  const [created] = await db
    .insert(customers)
    .values({ tenantId, name: data.name, phone: data.phone, email: data.email })
    .returning();
  return created;
}

/**
 * List customers with aggregate order stats (order count, total spent, last order).
 */
export async function getCustomers(tenantId: string) {
  return db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      createdAt: customers.createdAt,
      totalOrders: sql<number>`count(${orders.id})::int`,
      totalSpent: sql<string>`coalesce(sum(${orders.total}), 0)::numeric(12,2)`,
      lastOrderAt: sql<string | null>`max(${orders.createdAt})`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.tenantId, tenantId))
    .groupBy(customers.id)
    .orderBy(desc(sql`max(${orders.createdAt})`));
}

export async function getCustomerById(tenantId: string, customerId: string) {
  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)),
  });
  if (!customer) return null;

  const history = await db.query.orders.findMany({
    where: and(eq(orders.customerId, customerId), eq(orders.tenantId, tenantId)),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });

  return { ...customer, orders: history };
}
