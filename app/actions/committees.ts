"use server";

/**
 * Committee management — CRUD, rosters, officers, and meeting schedules.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { writeAuditLog } from "@/lib/audit";
import { meetingWindowValid } from "@/lib/committees/meeting-policy";
import {
  requiresChairDemotion,
  titleForOfficerRole,
  type CommitteeOfficerRoleValue,
} from "@/lib/committees/officer-roles";
import { getOrgDb } from "@/lib/db";
import { requireCapability } from "@/lib/permissions";
import {
  committeeInputSchema,
  committeeMeetingInputSchema,
  committeeMeetingUpdateSchema,
  committeeMemberInputSchema,
  committeeMemberUpdateSchema,
  committeeUpdateSchema,
} from "@/lib/validations/committee";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function parseOptionalDate(raw: string | undefined): Date | null {
  const s = raw?.trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function resolveMemberTitle(
  officerRole: CommitteeOfficerRoleValue | undefined,
  title: string | undefined,
): { officerRole: CommitteeOfficerRoleValue; title: string } {
  const role = officerRole ?? "MEMBER";
  if (role !== "MEMBER") {
    return { officerRole: role, title: titleForOfficerRole(role) };
  }
  const trimmed = title?.trim();
  return { officerRole: role, title: trimmed && trimmed.length > 0 ? trimmed : "Member" };
}

async function demoteExistingChair(
  db: ReturnType<typeof getOrgDb>,
  orgId: string,
  committeeId: string,
  exceptMembershipId?: string,
) {
  await db.committeeMembership.updateMany({
    where: {
      orgId,
      committeeId,
      isCurrent: true,
      officerRole: "CHAIR",
      ...(exceptMembershipId ? { id: { not: exceptMembershipId } } : {}),
    },
    data: { officerRole: "MEMBER", title: "Member" },
  });
}

function revalidateCommitteePaths(orgSlug: string, committeeId?: string) {
  revalidatePath(`/${orgSlug}/committees`);
  if (committeeId) {
    revalidatePath(`/${orgSlug}/committees/${committeeId}`);
  }
}

export async function createCommittee(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid committee data" };

    const db = getOrgDb(staff.orgId);
    const committee = await db.committee.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name.trim(),
        kind: parsed.data.kind,
        departmentId: parsed.data.departmentId,
        description: parsed.data.description?.trim() ?? "",
        isActive: parsed.data.isActive ?? true,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.created",
      entity: "Committee",
      entityId: committee.id,
      diff: { name: committee.name, kind: committee.kind },
    });

    revalidateCommitteePaths(orgSlug, committee.id);
    return { ok: true, data: { id: committee.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateCommittee(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeUpdateSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid committee data" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.committee.findFirst({
      where: { id: parsed.data.id, orgId: staff.orgId },
    });
    if (!existing) return { ok: false, error: "Committee not found" };

    await db.committee.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.kind !== undefined ? { kind: parsed.data.kind } : {}),
        ...(parsed.data.departmentId !== undefined
          ? { departmentId: parsed.data.departmentId }
          : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description.trim() }
          : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.updated",
      entity: "Committee",
      entityId: parsed.data.id,
      diff: parsed.data,
    });

    revalidateCommitteePaths(orgSlug, parsed.data.id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function archiveCommittee(
  orgSlug: string,
  committeeId: string,
): Promise<ActionResult> {
  return updateCommittee(orgSlug, { id: committeeId, isActive: false });
}

export async function addCommitteeMember(
  orgSlug: string,
  committeeId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeMemberInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid roster entry" };

    const db = getOrgDb(staff.orgId);
    const committee = await db.committee.findFirst({
      where: { id: committeeId, orgId: staff.orgId },
    });
    if (!committee) return { ok: false, error: "Committee not found" };

    const member = await db.member.findFirst({
      where: { id: parsed.data.memberId, orgId: staff.orgId },
    });
    if (!member) return { ok: false, error: "Member not found" };

    const { officerRole, title } = resolveMemberTitle(
      parsed.data.officerRole,
      parsed.data.title,
    );

    if (requiresChairDemotion(officerRole)) {
      await demoteExistingChair(db, staff.orgId, committeeId);
    }

    const membership = await db.committeeMembership.upsert({
      where: {
        committeeId_memberId: {
          committeeId,
          memberId: parsed.data.memberId,
        },
      },
      create: {
        orgId: staff.orgId,
        committeeId,
        memberId: parsed.data.memberId,
        title,
        officerRole,
        termStart: parseOptionalDate(parsed.data.termStart),
        termEnd: parseOptionalDate(parsed.data.termEnd),
        isCurrent: true,
      },
      update: {
        title,
        officerRole,
        termStart: parseOptionalDate(parsed.data.termStart),
        termEnd: parseOptionalDate(parsed.data.termEnd),
        isCurrent: true,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.member.added",
      entity: "CommitteeMembership",
      entityId: membership.id,
      diff: { committeeId, memberId: parsed.data.memberId, officerRole, title },
    });

    revalidateCommitteePaths(orgSlug, committeeId);
    return { ok: true, data: { id: membership.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateCommitteeMember(
  orgSlug: string,
  committeeId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeMemberUpdateSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid roster update" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.committeeMembership.findFirst({
      where: {
        id: parsed.data.membershipId,
        orgId: staff.orgId,
        committeeId,
        isCurrent: true,
      },
    });
    if (!existing) return { ok: false, error: "Roster entry not found" };

    const { officerRole, title } = resolveMemberTitle(
      parsed.data.officerRole ?? existing.officerRole,
      parsed.data.title ?? existing.title,
    );

    if (requiresChairDemotion(officerRole)) {
      await demoteExistingChair(db, staff.orgId, committeeId, existing.id);
    }

    await db.committeeMembership.update({
      where: { id: existing.id },
      data: {
        title,
        officerRole,
        termStart:
          parsed.data.termStart !== undefined
            ? parseOptionalDate(parsed.data.termStart)
            : existing.termStart,
        termEnd:
          parsed.data.termEnd !== undefined
            ? parseOptionalDate(parsed.data.termEnd)
            : existing.termEnd,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.member.updated",
      entity: "CommitteeMembership",
      entityId: existing.id,
      diff: { officerRole, title },
    });

    revalidateCommitteePaths(orgSlug, committeeId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function removeCommitteeMember(
  orgSlug: string,
  membershipId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const existing = await db.committeeMembership.findFirst({
      where: { id: membershipId, orgId: staff.orgId },
    });
    if (!existing) return { ok: false, error: "Roster entry not found" };

    await db.committeeMembership.update({
      where: { id: membershipId },
      data: { isCurrent: false },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.member.removed",
      entity: "CommitteeMembership",
      entityId: membershipId,
      diff: { committeeId: existing.committeeId, memberId: existing.memberId },
    });

    revalidateCommitteePaths(orgSlug, existing.committeeId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function scheduleCommitteeMeeting(
  orgSlug: string,
  committeeId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeMeetingInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid meeting data" };

    const db = getOrgDb(staff.orgId);
    const committee = await db.committee.findFirst({
      where: { id: committeeId, orgId: staff.orgId, isActive: true },
    });
    if (!committee) return { ok: false, error: "Committee not found" };

    const startsAt = new Date(parsed.data.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false, error: "Invalid start date" };
    }
    const endsAt = parseOptionalDate(parsed.data.endsAt);
    if (!meetingWindowValid(startsAt, endsAt)) {
      return { ok: false, error: "End time must be after start time" };
    }

    const meeting = await db.committeeMeeting.create({
      data: {
        orgId: staff.orgId,
        committeeId,
        title: parsed.data.title?.trim() ?? "",
        startsAt,
        endsAt,
        location: parsed.data.location?.trim() ?? "",
        virtualUrl: parsed.data.virtualUrl?.trim() ?? "",
        agenda: parsed.data.agenda?.trim() ?? "",
        status: "SCHEDULED",
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.meeting.scheduled",
      entity: "CommitteeMeeting",
      entityId: meeting.id,
      diff: { committeeId, startsAt: startsAt.toISOString() },
    });

    revalidateCommitteePaths(orgSlug, committeeId);
    return { ok: true, data: { id: meeting.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateCommitteeMeeting(
  orgSlug: string,
  committeeId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("committee:write", { orgSlug });
    const parsed = committeeMeetingUpdateSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid meeting update" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.committeeMeeting.findFirst({
      where: {
        id: parsed.data.meetingId,
        orgId: staff.orgId,
        committeeId,
      },
    });
    if (!existing) return { ok: false, error: "Meeting not found" };

    const startsAt =
      parsed.data.startsAt !== undefined
        ? new Date(parsed.data.startsAt)
        : existing.startsAt;
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false, error: "Invalid start date" };
    }
    const endsAt =
      parsed.data.endsAt !== undefined
        ? parseOptionalDate(parsed.data.endsAt)
        : existing.endsAt;
    if (!meetingWindowValid(startsAt, endsAt)) {
      return { ok: false, error: "End time must be after start time" };
    }

    await db.committeeMeeting.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title.trim() } : {}),
        startsAt,
        endsAt,
        ...(parsed.data.location !== undefined
          ? { location: parsed.data.location.trim() }
          : {}),
        ...(parsed.data.virtualUrl !== undefined
          ? { virtualUrl: parsed.data.virtualUrl.trim() }
          : {}),
        ...(parsed.data.agenda !== undefined ? { agenda: parsed.data.agenda.trim() } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "committee.meeting.updated",
      entity: "CommitteeMeeting",
      entityId: existing.id,
      diff: parsed.data,
    });

    revalidateCommitteePaths(orgSlug, committeeId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function cancelCommitteeMeeting(
  orgSlug: string,
  committeeId: string,
  meetingId: string,
): Promise<ActionResult> {
  return updateCommitteeMeeting(orgSlug, committeeId, {
    meetingId,
    status: "CANCELLED",
  });
}
