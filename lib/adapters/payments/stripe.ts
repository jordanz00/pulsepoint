/**
 * Stripe payment adapter — primary today.
 * Replaceable by lib/adapters/payments/manual.ts when offline / vendor-failure mode.
 */

import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentAdapter,
  PaymentEvent,
} from "@/lib/adapters/types";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const stripePaymentAdapter: PaymentAdapter = {
  id: "stripe",

  isConfigured() {
    return isStripeConfigured();
  },

  async startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
        customer_email: req.customerEmail ?? undefined,
        client_reference_id: req.ourReference,
        metadata: {
          orgId: req.orgId,
          ourReference: req.ourReference,
        },
        line_items: req.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: item.currency,
            unit_amount: item.amountCents,
            product_data: {
              name: item.name,
              metadata: { productRef: item.productRef },
            },
          },
        })),
      },
      { idempotencyKey: req.idempotencyKey },
    );

    return {
      providerCheckoutId: session.id,
      redirectUrl: session.url ?? null,
    };
  },

  async parseWebhook(rawBody: string, headers: Record<string, string>): Promise<PaymentEvent> {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    const sig = headers["stripe-signature"] ?? headers["Stripe-Signature"];
    if (!sig) throw new Error("missing stripe signature");
    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { client_reference_id?: string | null; amount_total?: number | null; currency?: string | null };
      return {
        providerEventId: event.id,
        type: "checkout.completed",
        ourReference: session.client_reference_id ?? "",
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
      };
    }
    if (event.type === "charge.refunded") {
      const charge = event.data.object as { metadata?: { ourReference?: string }; amount_refunded?: number; currency?: string };
      return {
        providerEventId: event.id,
        type: "payment.refunded",
        ourReference: charge.metadata?.ourReference ?? "",
        amountCents: charge.amount_refunded ?? 0,
        currency: charge.currency ?? "usd",
      };
    }
    return {
      providerEventId: event.id,
      type: "payment.failed",
      ourReference: "",
      amountCents: 0,
      currency: "usd",
    };
  },
};
