import { NextRequest, NextResponse } from "next/server";
import { productByCode } from "@/lib/store";

export const runtime = "nodejs";

// Public (staff app): resolve a scanned barcode/SKU to a product.
//   GET /api/products/scan?tenant=bigmos&code=012345678905
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  const product = await productByCode(code);
  if (!product) {
    return NextResponse.json({ error: "No product for that barcode", code }, { status: 404 });
  }
  return NextResponse.json(product);
}
