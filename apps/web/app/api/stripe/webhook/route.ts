import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db, orders } from "@bangers/db";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body required for signature verification
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    const tenantId = intent.metadata?.tenantId;

    if (orderId && tenantId) {
      await db
        .update(orders)
        .set({
          status: "confirmed",
          paymentStatus: "paid",
          paidAt: new Date(),
          stripePaymentIntentId: intent.id,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));
    }
  }

  return NextResponse.json({ received: true });
}
