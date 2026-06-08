/**
 * Segment filter engine — AND-combined member filters via getOrgDb.
 */

import type { MemberStatus } from "@/app/generated/prisma/client";
import { getOrgDb } from "@/lib/db";

export type SegmentFilter =
  | { field: "status"; operator: "is" | "isNot"; value: MemberStatus }
  | { field: "tag"; operator: "has" | "doesNotHave"; value: string }
  | { field: "joinedBefore"; operator: "before"; value: string }
  | { field: "joinedAfter"; operator: "after"; value: string }
  | { field: "attendedEvent"; operator: "attended"; value: string }
  | { field: "hasEmail"; operator: "is"; value: "true" | "false" };

function parseDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Returns member IDs matching all segment filters (AND).
 */
export async function evaluateSegment(
  orgId: string,
  filters: SegmentFilter[],
): Promise<string[]> {
  const db = getOrgDb(orgId);
  const members = await db.member.findMany({
    select: {
      id: true,
      status: true,
      email: true,
      tags: true,
      createdAt: true,
    },
  });

  let ids = members.map((m) => m.id);

  for (const filter of filters) {
    if (filter.field === "status") {
      const match = members
        .filter((m) =>
          filter.operator === "is"
            ? m.status === filter.value
            : m.status !== filter.value,
        )
        .map((m) => m.id);
      ids = ids.filter((id) => match.includes(id));
      continue;
    }

    if (filter.field === "tag") {
      const match = members
        .filter((m) => {
          const raw = m.tags;
          const tagStr =
            typeof raw === "string"
              ? raw
              : Array.isArray(raw)
                ? JSON.stringify(raw)
                : "";
          const has = tagStr.toLowerCase().includes(filter.value.toLowerCase());
          return filter.operator === "has" ? has : !has;
        })
        .map((m) => m.id);
      ids = ids.filter((id) => match.includes(id));
      continue;
    }

    if (filter.field === "joinedBefore") {
      const before = parseDate(filter.value);
      if (!before) continue;
      const match = members.filter((m) => m.createdAt < before).map((m) => m.id);
      ids = ids.filter((id) => match.includes(id));
      continue;
    }

    if (filter.field === "joinedAfter") {
      const after = parseDate(filter.value);
      if (!after) continue;
      const match = members.filter((m) => m.createdAt > after).map((m) => m.id);
      ids = ids.filter((id) => match.includes(id));
      continue;
    }

    if (filter.field === "hasEmail") {
      const want = filter.value === "true";
      const match = members
        .filter((m) => (Boolean(m.email?.trim()) === want))
        .map((m) => m.id);
      ids = ids.filter((id) => match.includes(id));
      continue;
    }

    if (filter.field === "attendedEvent") {
      const regs = await db.eventRegistration.findMany({
        where: {
          eventId: filter.value,
          status: "CONFIRMED",
        },
        select: { memberId: true },
      });
      const attended = new Set(regs.map((r) => r.memberId).filter(Boolean) as string[]);
      ids = ids.filter((id) => attended.has(id));
    }
  }

  return ids;
}

export async function countSegmentMembers(
  orgId: string,
  filters: SegmentFilter[],
): Promise<number> {
  const ids = await evaluateSegment(orgId, filters);
  return ids.length;
}
