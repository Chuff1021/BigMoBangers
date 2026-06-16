import { NextRequest, NextResponse } from "next/server";
import { adjustInventory, type InventoryReason } from "@bangers/db";
import { AdjustInventorySchema } from "@bangers/types";
import { getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ productId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { productId } = await params;
  const tenant = await getTenantFromRequest();
  const parsed = AdjustInventorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const product = await adjustInventory(
      tenant.id,
      productId,
      parsed.data.qtyChange,
      parsed.data.reason as InventoryReason,
      undefined,
      parsed.data.note
    );
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Adjustment failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
