# BangersOS

Two-surface SaaS platform for fireworks retail tents. Pilot tenant: **Big MO's Bangers** (Republic, MO).

## Surfaces
- **CRM dashboard** (`apps/web`) — Next.js App Router. Tent operators manage products, inventory, orders, customers. Auth via Clerk.
- **Mobile storefront** (`apps/mobile`) — Expo / React Native. Customers browse, build a cart, pay via Stripe, pick up in person.

## Shared packages
- **`@bangers/db`** (`packages/db`) — Drizzle ORM schema + typed query functions over Neon Postgres. Single source of truth for data access.
- **`@bangers/types`** (`packages/types`) — Zod schemas + inferred input types shared by both surfaces.

## Multi-tenancy
Every domain row carries a `tenantId`. All query functions take `tenantId` as the first argument and scope every read/write to it. Public API routes resolve the tenant from a `?tenant=<slug>` param; authed routes resolve it from the Clerk session (`getTenantFromRequest`). Never query without a tenant scope.

## Conventions
- Money is stored as Postgres `numeric(10,2)` and surfaces as a string in app code (`price: "49.99"`). Convert at the edges, never do float math on money.
- Inventory is mutated only through `adjustInventory` / order creation, which both write an `inventory_changes` audit row in the same transaction.
- Run `pnpm typecheck` from the root before declaring any step done.

## Toolchain
pnpm workspaces + Turborepo. Node 25, pnpm 11. DB ops via root scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio`.
