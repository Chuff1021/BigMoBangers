import { auth } from "@clerk/nextjs/server";
import { getTenantForClerk, getTenantBySlug, type Tenant } from "@bangers/db";

/**
 * Resolve the tenant for the current authenticated request.
 *
 * Resolution order:
 *  1. Clerk org/user → tenant_members mapping (multi-tenant production path).
 *  2. DEFAULT_TENANT_SLUG fallback so the pilot ("bigmos") works before any
 *     membership rows exist.
 *
 * Throws if no tenant can be resolved — callers should let this bubble to a 401/500.
 */
export async function getTenantFromRequest(): Promise<Tenant> {
  const { userId, orgId } = await auth();

  if (userId || orgId) {
    const tenant = await getTenantForClerk({ userId, orgId });
    if (tenant) return tenant;
  }

  const fallbackSlug = process.env.DEFAULT_TENANT_SLUG ?? "bigmos";
  const fallback = await getTenantBySlug(fallbackSlug);
  if (fallback) return fallback;

  throw new Error(
    "No tenant resolved for request. Seed a tenant or link a Clerk membership."
  );
}

/** Resolve a tenant from a public `?tenant=<slug>` query param. */
export async function getPublicTenant(slug: string | null): Promise<Tenant | null> {
  const resolved = slug ?? process.env.DEFAULT_TENANT_SLUG ?? "bigmos";
  return getTenantBySlug(resolved);
}
