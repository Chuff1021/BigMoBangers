import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@bangers/db";
import { CreateProductSchema } from "@bangers/types";
import { getPublicTenant, getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

// Public: list products for a storefront, scoped by ?tenant=<slug>.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const tenant = await getPublicTenant(sp.get("tenant"));
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  const featuredParam = sp.get("featured");
  const products = await getProducts(tenant.id, {
    categoryId: sp.get("categoryId") ?? undefined,
    search: sp.get("search") ?? undefined,
    isFeatured: featuredParam === null ? undefined : featuredParam === "true",
  });

  return NextResponse.json(products);
}

// Authed: create a product for the operator's tenant.
export async function POST(req: NextRequest) {
  const tenant = await getTenantFromRequest();
  const parsed = CreateProductSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await createProduct(tenant.id, parsed.data);
  return NextResponse.json(product, { status: 201 });
}
