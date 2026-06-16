import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhone } from "@bangers/db";
import { getPublicTenant } from "@/lib/auth";

export const runtime = "nodejs";

// Public: customers look up their own orders by phone (no account in MVP).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const tenant = await getPublicTenant(sp.get("tenant"));
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  const phone = sp.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  const orders = await getOrdersByPhone(tenant.id, phone);
  return NextResponse.json(orders);
}
