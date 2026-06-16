import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@bangers/db";
import { UpdateOrderStatusSchema } from "@bangers/types";
import { getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const parsed = UpdateOrderStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateOrderStatus(tenant.id, id, parsed.data.status);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
