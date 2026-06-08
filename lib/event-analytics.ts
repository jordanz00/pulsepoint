/**
 * EventCore analytics — computed from registrations (no invented metrics).
 */

import { getOrgDb } from "@/lib/db";
import { registrationPaidAmountCents } from "@/lib/events/registration-revenue";

export type EventAnalytics = {
  totalRegistrations: number;
  confirmed: number;
  pending: number;
  waitlist: number;
  cancelled: number;
  checkedIn: number;
  capacity: number | null;
  fillRatePct: number | null;
  checkInRatePct: number | null;
  revenueCents: number;
  registrationsByDay: { date: string; count: number }[];
};

export async function loadEventAnalytics(
  orgId: string,
  eventId: string,
  event: { capacity: number | null; priceCents: number },
): Promise<EventAnalytics> {
  const db = getOrgDb(orgId);
  const registrations = await db.eventRegistration.findMany({
    where: { eventId },
    select: {
      status: true,
      checkedInAt: true,
      paidAt: true,
      createdAt: true,
      ticketType: { select: { priceCents: true } },
    },
  });

  let confirmed = 0;
  let pending = 0;
  let waitlist = 0;
  let cancelled = 0;
  let checkedIn = 0;
  let revenueCents = 0;
  const byDay = new Map<string, number>();

  for (const r of registrations) {
    if (r.status === "CONFIRMED") confirmed++;
    else if (r.status === "PENDING") pending++;
    else if (r.status === "WAITLIST") waitlist++;
    else if (r.status === "CANCELLED") cancelled++;
    if (r.checkedInAt) checkedIn++;
    revenueCents += registrationPaidAmountCents({
      paidAt: r.paidAt,
      ticketType: r.ticketType,
      event,
    });
    const day = r.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const totalRegistrations = registrations.length;
  const denom = event.capacity ?? null;
  const fillRatePct =
    denom && denom > 0
      ? Math.round(((confirmed + pending) / denom) * 100)
      : null;
  const checkInRatePct =
    confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : null;

  const registrationsByDay = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    totalRegistrations,
    confirmed,
    pending,
    waitlist,
    cancelled,
    checkedIn,
    capacity: event.capacity,
    fillRatePct,
    checkInRatePct,
    revenueCents,
    registrationsByDay,
  };
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
