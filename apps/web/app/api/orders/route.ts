import { NextRequest, NextResponse } from "next/server";
import { CreateOrderSchema } from "@bangers/types";
import { listOrders, createOrderM } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const orders = await listOrders({ status });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const parsed = CreateOrderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const order = await createOrderM(parsed.data);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
