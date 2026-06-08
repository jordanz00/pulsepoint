"use server";

import { messageFromActionError } from "@/lib/action-errors";
import { getOrgDb } from "@/lib/db";
import { buildMemberSearchFilter } from "@/lib/member-search";
import { requireCapability } from "@/lib/permissions";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function searchMembers(
  orgSlug: string,
  query: string,
): Promise<
  ActionResult<{
    members: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      status: string;
    }>;
  }>
> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const q = query.trim();
    if (q.length < 2) return { ok: true, data: { members: [] } };
    const db = getOrgDb(staff.orgId);
    const members = await db.member.findMany({
      where: buildMemberSearchFilter(q) ?? {},
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 8,
    });
    return { ok: true, data: { members } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function searchCommittees(
  orgSlug: string,
  query: string,
): Promise<
  ActionResult<{
    committees: Array<{ id: string; name: string }>;
  }>
> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const q = query.trim();
    if (q.length < 2) return { ok: true, data: { committees: [] } };
    const db = getOrgDb(staff.orgId);
    const committees = await db.committee.findMany({
      where: { orgId: staff.orgId, name: { contains: q }, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 6,
    });
    return { ok: true, data: { committees } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function searchEvents(
  orgSlug: string,
  query: string,
): Promise<
  ActionResult<{
    events: Array<{ id: string; title: string; status: string }>;
  }>
> {
  try {
    const staff = await requireCapability("event:read", { orgSlug });
    const q = query.trim();
    if (q.length < 2) return { ok: true, data: { events: [] } };
    const db = getOrgDb(staff.orgId);
    const events = await db.event.findMany({
      where: { title: { contains: q } },
      select: { id: true, title: true, status: true },
      orderBy: { startsAt: "desc" },
      take: 8,
    });
    return { ok: true, data: { events } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
