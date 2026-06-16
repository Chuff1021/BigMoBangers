import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const order = await getOrderById(tenant.id, id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
