/**
 * Apply paid DUES commerce orders to member renewal dates.
 */

import type { BillingInterval } from "@/app/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { getOrgDb } from "@/lib/db";
import { computeNextRenewalDate } from "@/lib/renewals/compute-next-renewal";

export type ApplyDuesPaymentResult = {
  applied: boolean;
  memberId?: string;
  nextRenewalDueAt?: Date;
  reason?: string;
};

/**
 * When a CommerceOrder with DUES line items is paid, extend member.renewalDueAt.
 */
export async function applyDuesPaymentForOrder(
  orgId: string,
  orderId: string,
  paidAt: Date = new Date(),
): Promise<ApplyDuesPaymentResult> {
  const db = getOrgDb(orgId);
  const order = await db.commerceOrder.findFirst({
    where: { id: orderId, orgId },
    include: {
      member: { include: { tier: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) return { applied: false, reason: "order_not_found" };
  if (!order.memberId || !order.member) {
    return { applied: false, reason: "no_member_on_order" };
  }

  const duesItem = order.items.find((item) => item.product.kind === "DUES");
  if (!duesItem) return { applied: false, reason: "not_dues_order" };

  const tierFromProduct = await db.memberTier.findFirst({
    where: { orgId, productId: duesItem.productId },
  });

  const interval: BillingInterval =
    tierFromProduct?.billingInterval ??
    order.member.tier?.billingInterval ??
    "ANNUAL";

  const nextRenewalDueAt = computeNextRenewalDate(
    order.member.renewalDueAt,
    interval,
    paidAt,
  );

  await db.member.update({
    where: { id: order.memberId },
    data: {
      status: "ACTIVE",
      renewalDueAt: nextRenewalDueAt,
      tierId: tierFromProduct?.id ?? order.member.tierId,
    },
  });

  await writeAuditLog({
    orgId,
    userId: null,
    action: "member.renewal.extended",
    entity: "Member",
    entityId: order.memberId,
    diff: {
      orderId,
      previousDueAt: order.member.renewalDueAt?.toISOString() ?? null,
      nextRenewalDueAt: nextRenewalDueAt.toISOString(),
      interval,
      productId: duesItem.productId,
    },
  });

  return {
    applied: true,
    memberId: order.memberId,
    nextRenewalDueAt,
  };
}
