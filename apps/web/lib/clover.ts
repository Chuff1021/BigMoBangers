/**
 * Clover payments (replaces Stripe).
 *
 * Live mode uses Clover's hosted Checkout API to create a pay page, then the
 * customer is redirected there. Configure via env:
 *   CLOVER_API_TOKEN        — private API token (OAuth/API key)
 *   CLOVER_MERCHANT_ID      — merchant id
 *   CLOVER_ENVIRONMENT      — "sandbox" | "production" (default sandbox)
 *   NEXT_PUBLIC_CLOVER_MERCHANT_ID / NEXT_PUBLIC_CLOVER_ENVIRONMENT for the
 *   client-side Clover.js hosted iframe (optional).
 *
 * In demo mode none of this is called — the storefront simulates an approved
 * payment so the full flow is viewable without a merchant account.
 */

export const isCloverConfigured = Boolean(
  process.env.CLOVER_API_TOKEN && process.env.CLOVER_MERCHANT_ID
);

const ENV = process.env.CLOVER_ENVIRONMENT ?? "sandbox";

const BASE =
  ENV === "production"
    ? "https://api.clover.com"
    : "https://apisandbox.dev.clover.com";

export interface CloverLineItem {
  name: string;
  unitQty: number;
  price: number; // cents
}

export interface CloverCheckoutResult {
  checkoutSessionId: string | null;
  /** Hosted Clover pay page to redirect the customer to (null in demo). */
  href: string | null;
  configured: boolean;
}

/**
 * Create a Clover hosted checkout session for a set of line items.
 * Returns the hosted pay-page URL to redirect to.
 */
export async function createCloverCheckout(opts: {
  amountCents: number;
  orderNumber: string;
  customer: { name: string; phone?: string; email?: string };
  lineItems: CloverLineItem[];
}): Promise<CloverCheckoutResult> {
  if (!isCloverConfigured) {
    return { checkoutSessionId: null, href: null, configured: false };
  }

  const res = await fetch(
    `${BASE}/invoicingcheckoutservice/v1/checkouts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "X-Clover-Merchant-Id": process.env.CLOVER_MERCHANT_ID ?? "",
      },
      body: JSON.stringify({
        customer: {
          firstName: opts.customer.name,
          email: opts.customer.email,
          phoneNumber: opts.customer.phone,
        },
        shoppingCart: {
          lineItems: opts.lineItems.map((li) => ({
            name: li.name,
            unitQty: li.unitQty,
            price: li.price,
          })),
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clover checkout failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { checkoutSessionId?: string; href?: string };
  return {
    checkoutSessionId: data.checkoutSessionId ?? null,
    href: data.href ?? null,
    configured: true,
  };
}
