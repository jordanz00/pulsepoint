"use server";

/**
 * Member portal commerce — pay pending dues invoices from the portal.
 */

import { getPaymentAdapterForOrg } from "@/lib/adapters/payments";
import { writeAuditLog } from "@/lib/audit";
import { shouldSimulateDemoPayment } from "@/lib/demo-payment";
import { getOrgDb } from "@/lib/db";
import { memberCanPayOrder } from "@/lib/portal/order-checkout";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { prisma } from "@/lib/prisma";
import { applyDuesPaymentForOrder } from "@/lib/renewals/apply-dues-payment";

export type PortalCheckoutResult =
  | { ok: true; orderId: string; redirectUrl: string }
  | { ok: false; error: string };

/**
 * Resume checkout for an existing PENDING CommerceOrder (e.g. renewal sweep invoice).
 */
export async function startPortalPendingOrderCheckout(
  orgSlug: string,
  orderId: string,
): Promise<PortalCheckoutResult> {
  const ctx = await resolvePortalMember(orgSlug);
  if (!ctx.ok) {
    return { ok: false, error: "Sign in to pay this invoice." };
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const order = await db.commerceOrder.findFirst({
    where: { id: orderId, orgId: org.id },
    include: {
      items: { include: { product: true } },
      member: { select: { email: true } },
    },
  });

  if (!order || !memberCanPayOrder(order, ctx.member.id)) {
    return { ok: false, error: "Invoice not found or already paid." };
  }
  if (order.items.length === 0) {
    return { ok: false, error: "Invoice has no line items." };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adapter = await getPaymentAdapterForOrg(org.id);

  const checkout = await adapter.startCheckout({
    orgId: org.id,
    ourReference: order.id,
    successUrl: `${base}/${orgSlug}/portal?renewed=1`,
    cancelUrl: `${base}/${orgSlug}/portal?renewal_cancelled=1`,
    customerEmail: order.member?.email ?? undefined,
    idempotencyKey: `portal_order_${order.id}`,
    items: order.items.map((item) => ({
      productRef: item.productId,
      name: item.product.name,
      amountCents: item.priceCents,
      currency: order.currency,
      quantity: item.quantity,
    })),
  });

  await db.commerceOrder.update({
    where: { id: order.id },
    data: {
      paymentAdapterId: adapter.id,
      providerCheckoutId: checkout.providerCheckoutId ?? null,
    },
  });

  await writeAuditLog({
    orgId: org.id,
    userId: null,
    action: "portal.checkout.start",
    entity: "CommerceOrder",
    entityId: order.id,
    diff: { memberId: ctx.member.id, adapter: adapter.id },
  });

  if (shouldSimulateDemoPayment(adapter.id, checkout.redirectUrl)) {
    const paidAt = new Date();
    await db.commerceOrder.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt },
    });
    await applyDuesPaymentForOrder(org.id, order.id, paidAt);
    return {
      ok: true,
      orderId: order.id,
      redirectUrl: `${base}/${orgSlug}/portal?renewed=1`,
    };
  }

  if (!checkout.redirectUrl) {
    return { ok: false, error: "Checkout unavailable." };
  }

  return { ok: true, orderId: order.id, redirectUrl: checkout.redirectUrl };
}
