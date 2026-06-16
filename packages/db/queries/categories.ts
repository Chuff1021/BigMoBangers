import { asc, eq } from "drizzle-orm";
import { db } from "../client";
import { categories, type NewCategory } from "../schema";

export async function getCategories(tenantId: string) {
  return db.query.categories.findMany({
    where: eq(categories.tenantId, tenantId),
    orderBy: [asc(categories.sortOrder)],
  });
}

export async function createCategory(
  tenantId: string,
  data: Omit<NewCategory, "tenantId" | "id">
) {
  const [row] = await db
    .insert(categories)
    .values({ ...data, tenantId })
    .returning();
  return row;
}
