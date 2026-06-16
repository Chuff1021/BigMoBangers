import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

/**
 * Shared Stripe client. We don't pin `apiVersion` so the account default is used,
 * which avoids type drift between the installed SDK and a hardcoded version string.
 */
export const stripe = new Stripe(key ?? "sk_test_placeholder", {
  typescript: true,
  appInfo: { name: "BangersOS", version: "0.1.0" },
});

export const isStripeConfigured = Boolean(key);
