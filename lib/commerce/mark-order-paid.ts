/**
 * Mark a CommerceOrder PAID — shared by Stripe webhook and demo payment simulation.
 */

import { writeAuditLog } from "@/lib/audit";
import type { getOrgDb } from "@/lib/db";
import { applyDuesPaymentForOrder } from "@/lib/renewals/apply-dues-payment";

type OrgDb = ReturnType<typeof getOrgDb>;

export type MarkCommerceOrderPaidResult =
  | { ok: true; duplicate: true }
  | { ok: true; duplicate: false; orderId: string }
  | { ok: false; error: "not_found" };

export async function markCommerceOrderPaid(
  db: OrgDb,
  orgId: string,
  orderId: string,
  paidAt: Date,
  context?: { sessionId?: string },
): Promise<MarkCommerceOrderPaidResult> {
  const order = await db.commerceOrder.findFirst({
    where: { id: orderId, orgId },
  });
  if (!order) return { ok: false, error: "not_found" };
  if (order.status === "PAID") return { ok: true, duplicate: true };

  await db.commerceOrder.update({
    where: { id: order.id },
    data: { status: "PAID", paidAt },
  });
  await writeAuditLog({
    orgId,
    userId: null,
    action: "commerce.order.paid",
    entity: "CommerceOrder",
    entityId: order.id,
    diff: { sessionId: context?.sessionId ?? null },
  });
  await applyDuesPaymentForOrder(orgId, order.id, paidAt);
  return { ok: true, duplicate: false, orderId: order.id };
}
