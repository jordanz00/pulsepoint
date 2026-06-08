/**
 * PayPal payment adapter — Checkout via PayPal REST (when configured).
 */

import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentAdapter,
  PaymentEvent,
} from "@/lib/adapters/types";

function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export const paypalPaymentAdapter: PaymentAdapter = {
  id: "paypal",

  isConfigured() {
    return isPayPalConfigured();
  },

  async startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    if (!isPayPalConfigured()) {
      throw new Error("PayPal not configured");
    }
    const total = req.items.reduce((s, i) => s + i.amountCents * i.quantity, 0);
    const currency = req.items[0]?.currency ?? "usd";
    const base = process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) throw new Error("PayPal auth failed");

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: req.ourReference,
            amount: {
              currency_code: currency.toUpperCase(),
              value: (total / 100).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: req.successUrl,
          cancel_url: req.cancelUrl,
        },
      }),
    });
    const order = (await orderRes.json()) as { id?: string; links?: { rel: string; href: string }[] };
    const approve = order.links?.find((l) => l.rel === "approve");
    return {
      providerCheckoutId: order.id ?? `paypal_${req.ourReference}`,
      redirectUrl: approve?.href ?? null,
    };
  },

  async parseWebhook(): Promise<PaymentEvent> {
    throw new Error("PayPal webhook parsing not configured in this build");
  },
};
