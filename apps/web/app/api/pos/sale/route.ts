import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderM } from "@/lib/store";

export const runtime = "nodejs";

const SaleSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1) }))
    .min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  method: z.enum(["clover_terminal", "manual", "card", "cash"]).default("clover_terminal"),
});

// In-person register sale. Payment is handled outside this app on the mobile
// Clover device; this endpoint records the completed sale and decrements stock.
export async function POST(req: NextRequest) {
  const parsed = SaleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, customerName, customerPhone, method } = parsed.data;

  let order;
  const pickupNoteByMethod: Record<typeof method, string> = {
    clover_terminal: "In-store sale · paid on Clover terminal",
    manual: "In-store sale · manually recorded",
    card: "In-store sale · paid by card",
    cash: "In-store sale · paid by cash",
  };
  try {
    order = await createOrderM({
      customerName: customerName?.trim() || "Walk-in Customer",
      customerPhone: customerPhone?.trim() || undefined,
      pickupNote: pickupNoteByMethod[method],
      items,
      // Counter sales are fulfilled on the spot.
      status: "completed",
      paymentStatus: "paid",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sale failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ...order, method, href: null });
}
