import { NextRequest, NextResponse } from "next/server";
import { CreateProductSchema } from "@bangers/types";
import { listProducts, createProductM } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const featuredParam = sp.get("featured");
  const products = await listProducts({
    categoryId: sp.get("categoryId") ?? undefined,
    search: sp.get("search") ?? undefined,
    isFeatured: featuredParam === null ? undefined : featuredParam === "true",
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const parsed = CreateProductSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const product = await createProductM(parsed.data);
  return NextResponse.json(product, { status: 201 });
}
