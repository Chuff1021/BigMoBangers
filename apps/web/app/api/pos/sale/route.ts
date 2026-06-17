import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderM, getProduct } from "@/lib/store";
import { createCloverCheckout } from "@/lib/clover";
import { IS_DEMO } from "@/lib/mode";

export const runtime = "nodejs";

const SaleSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1) }))
    .min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  method: z.enum(["cash", "card"]).default("card"),
});

// In-person register sale. Creates a paid order and (for card, when Clover is
// live) returns a hosted Clover pay-page URL to complete the charge.
export async function POST(req: NextRequest) {
  const parsed = SaleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, customerName, customerPhone, method } = parsed.data;

  let order;
  try {
    order = await createOrderM({
      customerName: customerName?.trim() || "Walk-in Customer",
      customerPhone: customerPhone?.trim() || undefined,
      pickupNote: `In-store sale · ${method.toUpperCase()}`,
      items,
      // Counter sales are fulfilled on the spot.
      status: "completed",
      paymentStatus: "paid",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sale failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Cash, or demo: nothing more to charge.
  if (method === "cash" || IS_DEMO) {
    return NextResponse.json({ ...order, method, href: null });
  }

  // Live card sale: hand off to Clover hosted checkout.
  const lineItems = await Promise.all(
    items.map(async (it) => {
      const p = await getProduct(it.productId);
      return {
        name: p?.name ?? "Fireworks",
        unitQty: it.quantity,
        price: Math.round(Number(p?.price ?? 0) * 100),
      };
    })
  );
  const checkout = await createCloverCheckout({
    amountCents: Math.round(Number(order.total) * 100),
    orderNumber: order.orderNumber,
    customer: { name: customerName?.trim() || "Walk-in Customer", phone: customerPhone },
    lineItems,
  });

  return NextResponse.json({ ...order, method, href: checkout.href });
}
