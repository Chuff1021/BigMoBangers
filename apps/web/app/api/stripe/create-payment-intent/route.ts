import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@bangers/db";
import { CreateOrderSchema } from "@bangers/types";
import { getPublicTenant } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

// Reuses the order payload + a tenant slug. Validates the cart server-side,
// creates a pending order, then opens a PaymentIntent for its computed total.
const BodySchema = CreateOrderSchema.extend({
  tenantSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = parsed.data.tenantSlug ?? req.nextUrl.searchParams.get("tenant");
  const tenant = await getPublicTenant(slug);
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  let order;
  try {
    order = await createOrder(tenant.id, {
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
      pickupNote: parsed.data.pickupNote,
      items: parsed.data.items,
      taxRate: Number(tenant.taxRate),
      status: "pending",
      paymentStatus: "unpaid",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const amountCents = Math.round(Number(order.total) * 100);

  if (!isStripeConfigured) {
    // Allow the storefront flow to be exercised without live Stripe keys.
    return NextResponse.json({
      clientSecret: null,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: amountCents,
      stripeConfigured: false,
    });
  }

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tenantId: tenant.id,
    },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: amountCents,
    stripeConfigured: true,
  });
}
