/**
 * EventCore — resolve email recipients for correspondence segments.
 */

import { getOrgDb } from "@/lib/db";
import type { EventCorrespondenceSegment } from "@/lib/event-correspondence-types";

export type { EventCorrespondenceSegment } from "@/lib/event-correspondence-types";

export type EventRecipient = {
  registrationId: string | null;
  memberId: string | null;
  email: string;
  displayName: string;
};

function displayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  guestName: string | null | undefined,
): string {
  if (guestName?.trim()) return guestName.trim();
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Attendee";
}

export async function resolveEventRecipients(
  orgId: string,
  eventId: string,
  segment: EventCorrespondenceSegment,
): Promise<EventRecipient[]> {
  const db = getOrgDb(orgId);

  if (segment === "invite_prospects") {
    const registeredMemberIds = await db.eventRegistration.findMany({
      where: { eventId, memberId: { not: null } },
      select: { memberId: true },
    });
    const exclude = new Set(
      registeredMemberIds.map((r) => r.memberId).filter(Boolean) as string[],
    );
    const members = await db.member.findMany({
      where: {
        orgId,
        status: "ACTIVE",
        email: { not: null },
        id: { notIn: [...exclude] },
      },
      select: { id: true, email: true, firstName: true, lastName: true },
      take: 500,
    });
    return members
      .filter((m) => m.email)
      .map((m) => ({
        registrationId: null,
        memberId: m.id,
        email: m.email!.toLowerCase(),
        displayName: displayName(m.firstName, m.lastName, null),
      }));
  }

  const statusFilter =
    segment === "waitlist"
      ? "WAITLIST"
      : segment === "confirmed" || segment === "checked_in" || segment === "not_checked_in"
        ? "CONFIRMED"
        : segment === "pending"
          ? "PENDING"
          : undefined;

  const registrations = await db.eventRegistration.findMany({
    where: {
      eventId,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(segment === "checked_in" ? { checkedInAt: { not: null } } : {}),
      ...(segment === "not_checked_in" ? { checkedInAt: null } : {}),
    },
    include: { member: true },
    take: 500,
  });

  const out: EventRecipient[] = [];
  for (const r of registrations) {
    const email = (r.guestEmail ?? r.member?.email)?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    out.push({
      registrationId: r.id,
      memberId: r.memberId,
      email,
      displayName: displayName(
        r.member?.firstName,
        r.member?.lastName,
        r.guestName,
      ),
    });
  }
  return out;
}

export async function countEventSegment(
  orgId: string,
  eventId: string,
  segment: EventCorrespondenceSegment,
): Promise<number> {
  const list = await resolveEventRecipients(orgId, eventId, segment);
  return list.length;
}
