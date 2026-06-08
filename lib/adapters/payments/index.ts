/**
 * Payment adapter resolver — multi-gateway with org-level selection.
 */

import type { PaymentAdapter } from "@/lib/adapters/types";
import { manualPaymentAdapter } from "@/lib/adapters/payments/manual";
import { stripePaymentAdapter } from "@/lib/adapters/payments/stripe";
import { paypalPaymentAdapter } from "@/lib/adapters/payments/paypal";
import { squarePaymentAdapter } from "@/lib/adapters/payments/square";
import { prisma } from "@/lib/prisma";

const ALL_ADAPTERS: PaymentAdapter[] = [
  stripePaymentAdapter,
  paypalPaymentAdapter,
  squarePaymentAdapter,
  manualPaymentAdapter,
];

export function getActivePaymentAdapter(): PaymentAdapter {
  const choice = (process.env.PAYMENT_ADAPTER ?? "stripe").toLowerCase();
  return resolveAdapter(choice);
}

export function getPaymentAdapterById(id: string): PaymentAdapter | null {
  const adapter = ALL_ADAPTERS.find((a) => a.id === id);
  if (!adapter) return null;
  if (adapter.isConfigured()) return adapter;
  if (adapter.id === "manual") return manualPaymentAdapter;
  return null;
}

export async function getPaymentAdapterForOrg(orgId: string): Promise<PaymentAdapter> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { paymentGatewayConfig: true },
  });
  const cfg = org?.paymentGatewayConfig as { primary?: string } | null;
  if (cfg?.primary) {
    const picked = resolveAdapter(cfg.primary);
    if (picked.id !== "manual" || cfg.primary === "manual") return picked;
  }
  return getActivePaymentAdapter();
}

function resolveAdapter(id: string): PaymentAdapter {
  if (id === "manual") return manualPaymentAdapter;
  const adapter = ALL_ADAPTERS.find((a) => a.id === id);
  if (adapter?.isConfigured()) return adapter;
  if (stripePaymentAdapter.isConfigured()) return stripePaymentAdapter;
  if (paypalPaymentAdapter.isConfigured()) return paypalPaymentAdapter;
  if (squarePaymentAdapter.isConfigured()) return squarePaymentAdapter;
  return manualPaymentAdapter;
}

export function listConfiguredAdapters(): PaymentAdapter[] {
  return ALL_ADAPTERS.filter((a) => a.isConfigured());
}
