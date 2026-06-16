import { NextRequest, NextResponse } from "next/server";
import { ordersByPhone } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  const orders = await ordersByPhone(phone);
  return NextResponse.json(orders);
}
