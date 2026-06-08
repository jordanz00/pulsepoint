import { getOrgDb } from "@/lib/db";

export type EventCoreSummary = {
  totalEvents: number;
  published: number;
  upcoming: number;
  registrationsTotal: number;
  checkedInTotal: number;
};

export async function loadEventCoreSummary(orgId: string): Promise<EventCoreSummary> {
  const db = getOrgDb(orgId);
  const now = new Date();

  const [totalEvents, published, upcoming, registrationsTotal, checkedInTotal] =
    await Promise.all([
      db.event.count(),
      db.event.count({ where: { status: "PUBLISHED" } }),
      db.event.count({
        where: { status: "PUBLISHED", startsAt: { gte: now } },
      }),
      db.eventRegistration.count({ where: { orgId } }),
      db.eventRegistration.count({
        where: { orgId, checkedInAt: { not: null } },
      }),
    ]);

  return {
    totalEvents,
    published,
    upcoming,
    registrationsTotal,
    checkedInTotal,
  };
}
