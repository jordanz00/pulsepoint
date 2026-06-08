/**
 * Compute next membership renewal date after a dues payment.
 */

export type RenewalInterval = "MONTHLY" | "ANNUAL";

/**
 * Extend from the later of current due date or payment date, then add one billing period.
 */
export function computeNextRenewalDate(
  currentDueAt: Date | null,
  interval: RenewalInterval,
  paidAt: Date = new Date(),
): Date {
  const base =
    currentDueAt && currentDueAt.getTime() > paidAt.getTime() ? currentDueAt : paidAt;
  const next = new Date(base);
  if (interval === "MONTHLY") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}
