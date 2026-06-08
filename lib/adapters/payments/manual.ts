/**
 * Manual / offline payment adapter — vendor-failure fallback.
 *
 * Use cases:
 *   - Stripe outage or account suspended
 *   - Cash, check, ACH, or external invoicing where the AMS records the receipt
 *   - Self-hosted or air-gapped deployments
 *
 * Shape: returns instructions instead of a redirect; staff records the payment
 * via /admin → registration "mark paid" once funds clear.
 */

import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentAdapter,
  PaymentEvent,
} from "@/lib/adapters/types";
import crypto from "node:crypto";

export const manualPaymentAdapter: PaymentAdapter = {
  id: "manual",

  isConfigured() {
    return true; // always available — last-resort fallback
  },

  async startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    return {
      providerCheckoutId: `manual_${req.ourReference}`,
      redirectUrl: null,
    };
  },

  async parseWebhook(rawBody: string): Promise<PaymentEvent> {
    // Manual adapter ingests JSON posted by an admin webhook (e.g. payment ops UI).
    // The body must be HMAC-signed with MANUAL_WEBHOOK_SECRET so it cannot be forged.
    const secret = process.env.MANUAL_WEBHOOK_SECRET ?? "";
    if (!secret) throw new Error("MANUAL_WEBHOOK_SECRET not configured");
    const parsed = JSON.parse(rawBody) as {
      providerEventId: string;
      ourReference: string;
      amountCents: number;
      currency: string;
      sig: string;
    };
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${parsed.providerEventId}.${parsed.ourReference}.${parsed.amountCents}`)
      .digest("hex");
    if (parsed.sig !== expected) throw new Error("manual webhook signature invalid");
    return {
      providerEventId: parsed.providerEventId,
      type: "checkout.completed",
      ourReference: parsed.ourReference,
      amountCents: parsed.amountCents,
      currency: parsed.currency,
    };
  },
};
