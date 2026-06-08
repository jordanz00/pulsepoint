/**
 * Campaign fundraising progress — raised vs goal from paid donations.
 */

export type DonationAmountRow = {
  amountCents: number;
  paidAt: Date | null;
};

export function sumRaisedCents(donations: DonationAmountRow[]): number {
  return donations
    .filter((d) => d.paidAt != null)
    .reduce((sum, d) => sum + d.amountCents, 0);
}

export function campaignProgressPct(raisedCents: number, goalCents: number): number | null {
  if (goalCents <= 0) return null;
  return Math.min(100, Math.round((raisedCents / goalCents) * 1000) / 10);
}
