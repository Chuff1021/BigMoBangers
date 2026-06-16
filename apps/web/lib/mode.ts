/**
 * Demo mode lets the app render fully (storefront + dashboard) with no database
 * and no auth — used for the public Vercel preview. Enabled when BANGERS_DEMO=1
 * or when there is no DATABASE_URL to connect to.
 *
 * IMPORTANT: when demo, never import "@bangers/db" at module top-level — its
 * client calls neon(DATABASE_URL!) on import and would throw. Use dynamic import
 * inside the data facade (lib/store.ts) for the non-demo path only.
 */
export const IS_DEMO =
  process.env.BANGERS_DEMO === "1" || !process.env.DATABASE_URL;

export const TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "bigmos";
