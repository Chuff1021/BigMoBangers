import { eq } from "drizzle-orm";
import { db } from "../client";
import { tenants, tenantMembers, type NewTenant } from "../schema";

export async function getTenantBySlug(slug: string) {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });
  return result ?? null;
}

export async function getTenantById(tenantId: string) {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
  return result ?? null;
}

export async function createTenant(data: NewTenant) {
  const [row] = await db.insert(tenants).values(data).returning();
  return row;
}

/**
 * Resolve the tenant for a Clerk user or org via the membership table.
 * Returns null when the identity is not yet linked to any tenant.
 */
export async function getTenantForClerk(opts: {
  userId?: string | null;
  orgId?: string | null;
}) {
  const { userId, orgId } = opts;
  if (orgId) {
    const member = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.clerkOrgId, orgId),
    });
    if (member) return getTenantById(member.tenantId);
  }
  if (userId) {
    const member = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.clerkUserId, userId),
    });
    if (member) return getTenantById(member.tenantId);
  }
  return null;
}
