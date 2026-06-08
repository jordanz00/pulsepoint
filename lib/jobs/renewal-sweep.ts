/**
 * Renewal sweep — send reminders and create dues orders for members due soon.
 */

import { getOrgDb } from "@/lib/db";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { getPaymentAdapterById } from "@/lib/adapters/payments";

const REMINDER_DAYS = [90, 60, 30, 14, 7];

export async function runRenewalSweep(orgId: string, orgSlug: string): Promise<{ reminders: number; orders: number }> {
  const db = getOrgDb(orgId);
  const now = new Date();
  let reminders = 0;
  let orders = 0;

  const dueMembers = await db.member.findMany({
    where: {
      orgId,
      status: "ACTIVE",
      renewalDueAt: { not: null },
    },
    include: { tier: true },
    take: 500,
  });

  for (const member of dueMembers) {
    if (!member.renewalDueAt || !member.email) continue;
    const daysUntil = Math.ceil(
      (member.renewalDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (REMINDER_DAYS.includes(daysUntil)) {
      await sendEmailWithFailover({
        to: member.email,
        subject: `Membership renewal in ${daysUntil} days — ${member.tier?.name ?? "membership"}`,
        text: `Hi ${member.firstName},\n\nYour membership renews on ${member.renewalDueAt.toLocaleDateString()}.\n\nSign in to pay or renew: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${orgSlug}/portal\n\nThank you.`,
        idempotencyKey: `renewal-${member.id}-${daysUntil}`,
      });
      reminders++;
    }

    if (daysUntil <= 0 && member.tier) {
      const existing = await db.commerceOrder.findFirst({
        where: {
          orgId,
          memberId: member.id,
          status: "PENDING",
          createdAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        },
      });
      if (existing) continue;

      const product = await db.commerceProduct.findFirst({
        where: { orgId, kind: "DUES", active: true },
      });
      if (!product) continue;

      const order = await db.commerceOrder.create({
        data: {
          orgId,
          memberId: member.id,
          status: "PENDING",
          totalCents: member.tier.priceCents,
          currency: product.currency,
          paymentAdapterId: "stripe",
          items: {
            create: {
              orgId,
              productId: product.id,
              quantity: 1,
              priceCents: member.tier.priceCents,
            },
          },
        },
      });
      orders++;

      const adapter = getPaymentAdapterById("stripe");
      if (adapter?.isConfigured() && member.email) {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await adapter.startCheckout({
          orgId,
          ourReference: order.id,
          successUrl: `${base}/${orgSlug}/portal?renewed=1`,
          cancelUrl: `${base}/${orgSlug}/portal?renewal_cancelled=1`,
          customerEmail: member.email,
          items: [
            {
              productRef: product.id,
              name: `${member.tier.name} renewal`,
              amountCents: member.tier.priceCents,
              currency: product.currency,
              quantity: 1,
            },
          ],
          idempotencyKey: `renewal-order-${order.id}`,
        });
      }
    }
  }

  return { reminders, orders };
}
