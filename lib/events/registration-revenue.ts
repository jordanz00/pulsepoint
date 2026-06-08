/**
 * Paid event registration revenue — single source for KPIs and timelines.
 * Ticket type overrides event base (promo discounts not persisted on registration yet).
 */

export type RegistrationRevenueInput = {
  paidAt: Date | null;
  ticketType?: { priceCents: number } | null;
  event: { priceCents: number };
};

export function registrationPaidAmountCents(reg: RegistrationRevenueInput): number {
  if (!reg.paidAt) return 0;
  return reg.ticketType?.priceCents ?? reg.event.priceCents;
}

export function sumRegistrationRevenueCents(
  registrations: RegistrationRevenueInput[],
): number {
  return registrations.reduce((sum, r) => sum + registrationPaidAmountCents(r), 0);
}
