import { NextResponse } from "next/server";
import { listProducts } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await listProducts({ includeInactive: true });
  return NextResponse.json(products, {
    headers: { "Cache-Control": "no-store" },
  });
}
