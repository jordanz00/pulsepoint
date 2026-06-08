/**
 * Square payment adapter — payment links when SQUARE_ACCESS_TOKEN is set.
 */

import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentAdapter,
  PaymentEvent,
} from "@/lib/adapters/types";

function isSquareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

export const squarePaymentAdapter: PaymentAdapter = {
  id: "square",

  isConfigured() {
    return isSquareConfigured();
  },

  async startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    if (!isSquareConfigured()) throw new Error("Square not configured");
    const total = req.items.reduce((s, i) => s + i.amountCents * i.quantity, 0);
    const base = process.env.SQUARE_API_BASE ?? "https://connect.squareupsandbox.com";
    const locationId = process.env.SQUARE_LOCATION_ID ?? "";

    const linkRes = await fetch(`${base}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-12-18",
      },
      body: JSON.stringify({
        idempotency_key: req.idempotencyKey,
        order: {
          location_id: locationId,
          line_items: req.items.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            base_price_money: {
              amount: item.amountCents,
              currency: item.currency.toUpperCase(),
            },
          })),
        },
        checkout_options: {
          redirect_url: req.successUrl,
        },
      }),
    });
    const data = (await linkRes.json()) as {
      payment_link?: { id?: string; url?: string; long_url?: string };
    };
    const pl = data.payment_link;
    return {
      providerCheckoutId: pl?.id ?? `square_${req.ourReference}`,
      redirectUrl: pl?.long_url ?? pl?.url ?? null,
    };
  },

  async parseWebhook(): Promise<PaymentEvent> {
    throw new Error("Square webhook parsing not configured in this build");
  },
};
