"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const subSchema = z.object({
  memberId: z.string(),
  tierId: z.string().optional(),
  productId: z.string().optional(),
  billingInterval: z.enum(["MONTHLY", "ANNUAL"]),
  paymentAdapterId: z.string().optional(),
});

function nextBill(interval: "MONTHLY" | "ANNUAL"): Date {
  const d = new Date();
  if (interval === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function createMemberSubscription(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = subSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid subscription" };
    const db = getOrgDb(staff.orgId);
    const sub = await db.memberSubscription.create({
      data: {
        orgId: staff.orgId,
        memberId: parsed.data.memberId,
        tierId: parsed.data.tierId ?? null,
        productId: parsed.data.productId ?? null,
        billingInterval: parsed.data.billingInterval,
        paymentAdapterId: parsed.data.paymentAdapterId ?? "stripe",
        nextBillAt: nextBill(parsed.data.billingInterval),
      },
    });
    revalidatePath(`/${orgSlug}/members/renewals`);
    revalidatePath(`/${orgSlug}/commerce`);
    return { ok: true, data: { id: sub.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function listSubscriptions(orgSlug: string) {
  const staff = await requireCapability("member:read", { orgSlug });
  const db = getOrgDb(staff.orgId);
  return db.memberSubscription.findMany({
    where: { orgId: staff.orgId },
    include: { member: true, tier: true, product: true },
    orderBy: { nextBillAt: "asc" },
    take: 100,
  });
}
