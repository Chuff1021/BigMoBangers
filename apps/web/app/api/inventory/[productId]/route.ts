import { NextRequest, NextResponse } from "next/server";
import { AdjustInventorySchema } from "@bangers/types";
import { adjustInventoryM } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ productId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { productId } = await params;
  const parsed = AdjustInventorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const product = await adjustInventoryM(
      productId,
      parsed.data.qtyChange,
      parsed.data.reason,
      parsed.data.note
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Adjustment failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
