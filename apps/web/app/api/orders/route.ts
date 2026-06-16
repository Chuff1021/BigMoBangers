import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@bangers/db";
import { CreateOrderSchema } from "@bangers/types";
import { getPublicTenant, getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

// Authed: order queue for the operator.
export async function GET(req: NextRequest) {
  const tenant = await getTenantFromRequest();
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const orders = await getOrders(tenant.id, { status });
  return NextResponse.json(orders);
}

// Public: a mobile customer places an order (?tenant=<slug>).
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("tenant");
  const tenant = await getPublicTenant(slug);
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  const parsed = CreateOrderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const order = await createOrder(tenant.id, {
      ...parsed.data,
      taxRate: Number(tenant.taxRate),
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
