/**
 * Mark a donation paid after checkout — shared by webhook and demo mode.
 */

import type { getOrgDb } from "@/lib/db";

type OrgDb = ReturnType<typeof getOrgDb>;

export async function markDonationPaid(
  db: OrgDb,
  donationId: string,
  opts?: { paymentIntentId?: string | null; adapterId?: string },
): Promise<boolean> {
  const donation = await db.donation.findFirst({ where: { id: donationId } });
  if (!donation || donation.paidAt) return false;

  await db.donation.update({
    where: { id: donationId },
    data: {
      paidAt: new Date(),
      ...(opts?.paymentIntentId
        ? { providerCheckoutId: opts.paymentIntentId }
        : {}),
      ...(opts?.adapterId ? { paymentAdapterId: opts.adapterId } : {}),
    },
  });

  return true;
}
