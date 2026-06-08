/**
 * Subscription billing — process due member subscriptions (dues auto-charge).
 */

import { getOrgDb } from "@/lib/db";
import { getPaymentAdapterById } from "@/lib/adapters/payments";

export async function runSubscriptionBilling(orgId: string, orgSlug: string): Promise<{ billed: number }> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const due = await db.memberSubscription.findMany({
    where: { orgId, status: "ACTIVE", nextBillAt: { lte: now } },
    include: { member: true, product: true, tier: true },
    take: 200,
  });

  let billed = 0;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  for (const sub of due) {
    const member = sub.member;
    const amount = sub.product?.priceCents ?? sub.tier?.priceCents ?? 0;
    if (amount <= 0 || !member.email) continue;

    const productId = sub.productId ?? sub.product?.id;
    if (!productId) continue;

    const order = await db.commerceOrder.create({
      data: {
        orgId,
        memberId: member.id,
        status: "PENDING",
        totalCents: amount,
        paymentAdapterId: sub.paymentAdapterId,
        items: {
          create: {
            orgId,
            productId,
            quantity: 1,
            priceCents: amount,
          },
        },
      },
    });

    const adapter = getPaymentAdapterById(sub.paymentAdapterId);
    if (adapter?.isConfigured()) {
      await adapter.startCheckout({
        orgId,
        ourReference: order.id,
        successUrl: `${base}/${orgSlug}/portal?sub=1`,
        cancelUrl: `${base}/${orgSlug}/portal`,
        customerEmail: member.email,
        items: [
          {
            productRef: productId,
            name: sub.tier?.name ?? sub.product?.name ?? "Membership dues",
            amountCents: amount,
            currency: "usd",
            quantity: 1,
          },
        ],
        idempotencyKey: `sub-${sub.id}-${now.toISOString().slice(0, 10)}`,
      });
    }

    const next = new Date(sub.nextBillAt);
    if (sub.billingInterval === "MONTHLY") next.setMonth(next.getMonth() + 1);
    else next.setFullYear(next.getFullYear() + 1);

    await db.memberSubscription.update({
      where: { id: sub.id },
      data: { lastBillAt: now, nextBillAt: next },
    });
    billed++;
  }

  return { billed };
}
