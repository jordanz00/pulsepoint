/**
 * Committee loaders — list, detail, rosters, and meetings.
 */

import { getOrgDb } from "@/lib/db";
import { officerSortOrder } from "@/lib/committees/officer-roles";

export async function loadCommitteeRoster(orgId: string) {
  const db = getOrgDb(orgId);
  return db.committee.findMany({
    where: { orgId },
    include: {
      memberships: {
        where: { isCurrent: true },
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: [{ createdAt: "asc" }],
      },
      meetings: {
        where: { status: "SCHEDULED" },
        orderBy: { startsAt: "asc" },
        take: 3,
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function loadCommitteeDetail(orgId: string, committeeId: string) {
  const db = getOrgDb(orgId);
  const committee = await db.committee.findFirst({
    where: { id: committeeId, orgId },
    include: {
      memberships: {
        where: { isCurrent: true },
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      meetings: {
        orderBy: { startsAt: "asc" },
        take: 30,
      },
    },
  });
  if (!committee) return null;

  const memberships = [...committee.memberships].sort(
    (a, b) =>
      officerSortOrder(a.officerRole) - officerSortOrder(b.officerRole) ||
      a.title.localeCompare(b.title),
  );

  return { ...committee, memberships };
}

export async function loadCommitteeMemberOptions(orgId: string, take = 120) {
  const db = getOrgDb(orgId);
  return db.member.findMany({
    where: { orgId, status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take,
  });
}
