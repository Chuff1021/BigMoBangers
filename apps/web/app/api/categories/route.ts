import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@bangers/db";
import { getPublicTenant } from "@/lib/auth";

export const runtime = "nodejs";

// Public: storefront + product form read categories by ?tenant=<slug>.
export async function GET(req: NextRequest) {
  const tenant = await getPublicTenant(req.nextUrl.searchParams.get("tenant"));
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  const categories = await getCategories(tenant.id);
  return NextResponse.json(categories);
}
