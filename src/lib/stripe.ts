import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

let stripeInstance: Stripe | undefined;

/**
 * Lazily-constructed Stripe client. Throws only when used without a key, so the
 * app builds and runs before Stripe is set up. Paid status is flipped by the
 * webhook at /api/stripe/webhook (never by polling).
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  }
  return stripeInstance;
}
