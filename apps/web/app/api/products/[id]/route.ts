import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductById, updateProduct, deleteProduct } from "@bangers/db";
import { UpdateProductSchema } from "@bangers/types";
import { getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

// CRM may also toggle a product's active/visibility flag, which is operator-only
// and therefore not part of the shared CreateProduct schema.
const UpdateProductRouteSchema = UpdateProductSchema.extend({
  isActive: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const product = await getProductById(tenant.id, id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const parsed = UpdateProductRouteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateProduct(tenant.id, id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const deleted = await deleteProduct(tenant.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
