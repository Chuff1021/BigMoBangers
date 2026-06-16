import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusM } from "@/lib/store";
import { IS_DEMO } from "@/lib/mode";

export const runtime = "nodejs";

/**
 * Clover webhook. Clover sends payment/checkout events here. On a successful
 * payment we mark the matching order confirmed. (Verification of the Clover
 * signature header should be added with the real merchant's signing secret.)
 */
export async function POST(req: NextRequest) {
  // Clover sends a verification challenge on endpoint setup.
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);

  if ((body as { verificationCode?: string }).verificationCode) {
    return NextResponse.json({ ok: true });
  }

  if (IS_DEMO) {
    return NextResponse.json({ received: true, demo: true });
  }

  const orderId = (body as { metadata?: { orderId?: string } }).metadata?.orderId;
  const type = (body as { type?: string }).type;

  if (orderId && (type === "PAYMENT_PROCESSED" || type === "checkout.completed")) {
    await updateOrderStatusM(orderId, "confirmed");
  }

  return NextResponse.json({ received: true });
}
