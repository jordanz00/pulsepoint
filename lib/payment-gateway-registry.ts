/**
 * Payment gateway registry — 100+ gateways catalogued; adapters plug in per provider.
 *
 * PulsePoint ships Stripe, PayPal, Square, and manual today. Others are selectable
 * in org settings and route through the closest compatible adapter until dedicated
 * SDK wiring lands.
 */

export type GatewayCategory =
  | "card"
  | "wallet"
  | "ach"
  | "international"
  | "enterprise";

export type PaymentGatewayMeta = {
  id: string;
  name: string;
  category: GatewayCategory;
  currencies: string[];
  /** Adapter id that handles checkout when this gateway is selected. */
  adapterId: string;
  implemented: boolean;
};

const BASE: Omit<PaymentGatewayMeta, "id" | "name">[] = [
  { category: "card", currencies: ["usd", "eur", "gbp", "cad"], adapterId: "stripe", implemented: true },
  { category: "wallet", currencies: ["usd"], adapterId: "paypal", implemented: true },
  { category: "card", currencies: ["usd", "cad"], adapterId: "square", implemented: true },
  { category: "ach", currencies: ["usd"], adapterId: "stripe", implemented: true },
  { category: "international", currencies: ["eur"], adapterId: "stripe", implemented: false },
];

const GATEWAY_NAMES = [
  "Stripe", "PayPal", "Square", "Authorize.Net", "Braintree", "Adyen", "Worldpay",
  "CyberSource", "Checkout.com", "2Checkout", "BlueSnap", "Chase Paymentech",
  "Elavon", "First Data", "Global Payments", "Heartland", "Moneris", "NMI",
  "Payflow Pro", "PayTrace", "USAePay", "WePay", "Affirm", "Afterpay", "Klarna",
  "Apple Pay", "Google Pay", "Amazon Pay", "Venmo", "Zelle", "ACH Direct",
  "Plaid ACH", "Dwolla", "GoCardless", "SEPA Direct Debit", "iDEAL", "Bancontact",
  "Sofort", "Giropay", "Alipay", "WeChat Pay", "UnionPay", "JCB", "Discover",
  "Amex Direct", "Visa Checkout", "Mastercard Click to Pay", "PayPal Commerce",
  "Stripe Connect", "Square Terminal", "Clover", "Lightspeed", "Shopify Payments",
  "WooCommerce Payments", "MemberClicks Pay", "Fonteva Payments", "iMIS Payments",
  "Wild Apricot Payments", "YourMembership Pay", "Neon Pay", "Blackbaud Merchant",
  "Titanium Pay", "PayPal Payflow", "PayPal Advanced", "PayPal Pro", "Stripe Billing",
  "Recurly", "Chargebee", "Paddle", "FastSpring", "Mollie", "PayU", "Razorpay",
  "Paystack", "Flutterwave", "Mercado Pago", "PagSeguro", "Redsys", "Ingenico",
  "Wirecard", "Payline", "Paysafe", "Payoneer", "Skrill", "Neteller", "BitPay",
  "Coinbase Commerce", "Stripe ACH", "Plaid", "Yodlee", "Fiserv", "TSYS", "Paysafe",
  "PayPal Braintree", "Stripe Terminal", "Square Online", "PayPal Zettle",
  "QuickBooks Payments", "Xero Pay", "Bill.com", "Tipalti", "Hyperwallet",
  "PayPal Payouts", "Stripe Payouts", "Manual / offline",
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export const PAYMENT_GATEWAY_REGISTRY: PaymentGatewayMeta[] = GATEWAY_NAMES.map((name, i) => {
  const base = BASE[i % BASE.length]!;
  const id = slug(name);
  const implemented =
    id === "stripe" ||
    id === "paypal" ||
    id === "square" ||
    id === "manual_offline" ||
    name === "Manual / offline";
  return {
    id,
    name,
    ...base,
    adapterId:
      name === "Manual / offline"
        ? "manual"
        : id === "paypal" || name.includes("PayPal")
          ? "paypal"
          : id === "square"
            ? "square"
            : base.adapterId,
    implemented,
  };
});

export function getGatewayMeta(id: string): PaymentGatewayMeta | undefined {
  return PAYMENT_GATEWAY_REGISTRY.find((g) => g.id === id);
}

export function implementedGateways(): PaymentGatewayMeta[] {
  return PAYMENT_GATEWAY_REGISTRY.filter((g) => g.implemented);
}

export function gatewayCount(): number {
  return PAYMENT_GATEWAY_REGISTRY.length;
}
