/**
 * Two independent switches:
 *
 * - IS_DEMO  → data source. True when there's no DATABASE_URL (or BANGERS_DEMO=1),
 *   so the app serves in-memory demo data. Once a real Neon DB is connected this
 *   flips to false and the app reads live data.
 *
 * - AUTH_ENABLED → whether the operator dashboard requires a Clerk login. True
 *   only when Clerk keys are present. This is DECOUPLED from IS_DEMO so the
 *   dashboard can run on the real database while still open (no login) until
 *   Clerk keys are added — then it locks automatically.
 *
 * IMPORTANT: when IS_DEMO, never import "@bangers/db" at module top-level — its
 * client calls neon(DATABASE_URL!) on import. The data facade (lib/store.ts)
 * dynamic-imports it only on the non-demo path.
 */
export const IS_DEMO =
  process.env.BANGERS_DEMO === "1" || !process.env.DATABASE_URL;

export const AUTH_ENABLED =
  process.env.BANGERS_AUTH !== "0" &&
  Boolean(
    process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

export const TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "bigmos";
