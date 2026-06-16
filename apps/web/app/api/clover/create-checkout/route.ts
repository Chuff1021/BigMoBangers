import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateOrderSchema } from "@bangers/types";
import { createOrderM, getProduct } from "@/lib/store";
import { createCloverCheckout } from "@/lib/clover";
import { IS_DEMO } from "@/lib/mode";

export const runtime = "nodejs";

const BodySchema = CreateOrderSchema.extend({ tenantSlug: z.string().optional() });

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Create the order (pending until Clover confirms; demo marks it paid).
  let order;
  try {
    order = await createOrderM({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      pickupNote: data.pickupNote,
      items: data.items,
      status: IS_DEMO ? "confirmed" : "pending",
      paymentStatus: IS_DEMO ? "paid" : "unpaid",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const amountCents = Math.round(Number(order.total) * 100);

  // Demo: simulate an approved Clover payment so the flow completes.
  if (IS_DEMO) {
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: amountCents,
      href: null,
      cloverConfigured: false,
      demo: true,
    });
  }

  // Build Clover line items.
  const lineItems = await Promise.all(
    data.items.map(async (it) => {
      const p = await getProduct(it.productId);
      return {
        name: p?.name ?? "Fireworks",
        unitQty: it.quantity,
        price: Math.round(Number(p?.price ?? 0) * 100),
      };
    })
  );

  const checkout = await createCloverCheckout({
    amountCents,
    orderNumber: order.orderNumber,
    customer: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
    },
    lineItems,
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: amountCents,
    href: checkout.href,
    cloverConfigured: checkout.configured,
    demo: false,
  });
}
