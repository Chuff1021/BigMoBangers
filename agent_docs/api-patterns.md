# API Patterns

How the `apps/web` route handlers are structured. Mirrors `lib/auth.ts`.

## Tenant resolution

Two paths, never mix them:

- **Authed routes** (CRM): `const tenant = await getTenantFromRequest()`. Uses the
  Clerk session (`auth()`), maps the user/org to a tenant via `tenant_members`,
  and falls back to `DEFAULT_TENANT_SLUG` for the pilot.
- **Public routes** (mobile storefront, webhooks): resolve from the
  `?tenant=<slug>` query param via `getPublicTenant(slug)`.

```ts
// authed
export async function GET() {
  const tenant = await getTenantFromRequest();
  const products = await getProducts(tenant.id);
  return Response.json(products);
}

// public
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("tenant");
  const tenant = await getPublicTenant(slug);
  if (!tenant) return Response.json({ error: "Unknown tenant" }, { status: 404 });
  const products = await getProducts(tenant.id, { isFeatured: true });
  return Response.json(products);
}
```

## Validation

Parse bodies with the shared Zod schemas from `@bangers/types`. On failure return
`400` with `error.flatten()`:

```ts
const parsed = CreateProductSchema.safeParse(await req.json());
if (!parsed.success) {
  return Response.json({ error: parsed.error.flatten() }, { status: 400 });
}
```

## Conventions

- Always scope every query by `tenant.id` — the query functions enforce this by
  taking `tenantId` as their first argument.
- Money values cross the wire as strings (`"49.99"`).
- Public routes are whitelisted in `middleware.ts` (`isPublicRoute`). Everything
  else is protected by `auth.protect()`.
- Stripe webhook reads the raw body and verifies the signature before acting.
