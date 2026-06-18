import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { payments, profiles } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Paid status is flipped HERE (webhook-driven), never by
 * polling — so switching a user to paid is not a later rebuild.
 *
 * The Checkout Session is expected to carry the buyer's profile id in
 * `metadata.userId` (or `client_reference_id`), set when the session is created
 * (that part is built with the payment UI later).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 400 },
    );
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.metadata?.userId ?? session.client_reference_id ?? null;

    if (userId) {
      const db = getDb();

      // Idempotent: keyed on the checkout session id.
      await db
        .insert(payments)
        .values({
          userId,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          amount: session.amount_total ?? null,
          currency: session.currency ?? "usd",
          status: "paid",
        })
        .onConflictDoNothing({ target: payments.stripeCheckoutSessionId });

      await db
        .update(profiles)
        .set({ isPaid: true, paidAt: new Date() })
        .where(eq(profiles.id, userId));
    }
  }

  return NextResponse.json({ received: true });
}
