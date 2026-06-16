import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UpdateProductSchema } from "@bangers/types";
import { getProduct, updateProductM, deleteProductM } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const UpdateProductRouteSchema = UpdateProductSchema.extend({
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const parsed = UpdateProductRouteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateProductM(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = await deleteProductM(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
