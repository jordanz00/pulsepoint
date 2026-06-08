"use server";

/**
 * Member CRM server actions — PulsePoint Phase 1
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import {
  assertAllRowsBelongToOrg,
  capMemberListRows,
} from "@/lib/tenant-guards";
import { countBlockingRegistrations } from "@/lib/member-deletion";
import { memberTagsArray, memberTagsJson } from "@/lib/member-tags";
import {
  memberHasCSuite,
  memberHasExternalBoard,
  summarizeMemberRoles,
} from "@/lib/member-roles";
import {
  memberInputSchema,
  memberSearchSchema,
} from "@/lib/validations/member";
import { buildMemberSearchFilter } from "@/lib/member-search";
import {
  EXPORT_BATCH_SIZE,
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
} from "@/lib/pagination";

function parseRenewalDate(raw: string | undefined): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function listMembers(
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult<{ members: Awaited<ReturnType<typeof fetchMembers>> }>> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const parsed = memberSearchSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid search parameters" };
    }
    const members = await fetchMembers(staff.orgId, parsed.data);
    return { ok: true, data: { members } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

async function fetchMembers(
  orgId: string,
  filters: { q?: string; status?: "ACTIVE" | "INACTIVE" | "LAPSED" },
) {
  const db = getOrgDb(orgId);
  const q = filters.q?.trim();

  const rows = await db.member.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(buildMemberSearchFilter(q) ?? {}),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
  });
  assertAllRowsBelongToOrg(rows, orgId, "fetchMembers");
  return capMemberListRows(rows, "fetchMembers");
}

export async function getMember(
  memberId: string,
  orgSlug?: string,
): Promise<ActionResult<{ member: NonNullable<Awaited<ReturnType<typeof fetchOneMember>>> }>> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const member = await fetchOneMember(staff.orgId, memberId);
    if (!member) return { ok: false, error: "Member not found" };
    return { ok: true, data: { member } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

async function fetchOneMember(orgId: string, memberId: string) {
  const db = getOrgDb(orgId);
  const member = await db.member.findFirst({ where: { id: memberId } });
  if (member) {
    assertAllRowsBelongToOrg([member], orgId, "fetchOneMember");
  }
  return member;
}

export async function createMember(
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult<{ memberId: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid member data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;
    const email = normalizeEmail(input.email);

    if (email) {
      const dupe = await db.member.findFirst({ where: { email } });
      if (dupe) {
        return { ok: false, error: "A member with this email already exists" };
      }
    }

    const member = await db.member.create({
      data: {
        orgId: staff.orgId,
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone || null,
        status: input.status ?? "ACTIVE",
        company: input.company || null,
        jobTitle: input.jobTitle || null,
        linkedInUrl: input.linkedInUrl || null,
        websiteUrl: input.websiteUrl || null,
        relationshipHealth: input.relationshipHealth ?? "STEADY",
        nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : null,
        tierId: input.tierId || null,
        renewalDueAt: parseRenewalDate(input.renewalDueAt),
        organizationAccountId: input.organizationAccountId || null,
        tags: memberTagsJson(input.tags) as Prisma.InputJsonValue,
        customFields: (input.customFields ?? {}) as Prisma.InputJsonValue,
      },
    });

    await db.contactSource.create({
      data: {
        orgId: staff.orgId,
        memberId: member.id,
        sourceKind: "MANUAL",
        label: "Staff created",
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.created",
      entity: "Member",
      entityId: member.id,
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true, data: { memberId: member.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateMember(
  memberId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid member data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;
    const email = normalizeEmail(input.email);

    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    if (email && email !== existing.email) {
      const dupe = await db.member.findFirst({
        where: { email, id: { not: memberId } },
      });
      if (dupe) {
        return { ok: false, error: "A member with this email already exists" };
      }
    }

    await db.member.update({
      where: { id: memberId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone || null,
        status: input.status ?? existing.status,
        company: input.company ?? existing.company,
        jobTitle: input.jobTitle ?? existing.jobTitle,
        linkedInUrl: input.linkedInUrl ?? existing.linkedInUrl,
        websiteUrl: input.websiteUrl ?? existing.websiteUrl,
        relationshipHealth: input.relationshipHealth ?? existing.relationshipHealth,
        nextFollowUpAt: input.nextFollowUpAt
          ? new Date(input.nextFollowUpAt)
          : existing.nextFollowUpAt,
        tierId: input.tierId !== undefined ? input.tierId || null : existing.tierId,
        renewalDueAt:
          input.renewalDueAt !== undefined
            ? parseRenewalDate(input.renewalDueAt)
            : existing.renewalDueAt,
        organizationAccountId:
          input.organizationAccountId !== undefined
            ? input.organizationAccountId || null
            : existing.organizationAccountId,
        tags: memberTagsJson(
          input.tags ?? memberTagsArray(existing.tags),
        ) as Prisma.InputJsonValue,
        customFields: (input.customFields ??
          existing.customFields) as Prisma.InputJsonValue,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.updated",
      entity: "Member",
      entityId: memberId,
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteMember(
  memberId: string,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:delete", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    const regCount = await countBlockingRegistrations(db, memberId);
    if (regCount > 0) {
      return {
        ok: false,
        error:
          "Member has event registrations and cannot be deleted. Registrations are retained for audit; contact an admin.",
      };
    }

    await db.memberNote.deleteMany({ where: { memberId } });
    await db.member.delete({ where: { id: memberId } });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.deleted",
      entity: "Member",
      entityId: memberId,
      diff: {
        snapshot: {
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
        },
      },
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

function normalizeEmail(raw: string | undefined): string | null {
  const e = raw?.trim().toLowerCase();
  return e && e.includes("@") ? e : null;
}

export async function exportMembersCsv(
  orgSlug?: string,
): Promise<ActionResult<{ csv: string; count: number }>> {
  try {
    const staff = await requireCapability("member:export", { orgSlug });
    const db = getOrgDb(staff.orgId);

    const header =
      "id,firstName,lastName,email,phone,status,company,jobTitle,tierName,renewalDueAt,organizationName,joinedAt,tags,rolesSummary";
    const lines: string[] = [header];
    let cursor: string | undefined;
    let count = 0;

    while (true) {
      const batch = await db.member.findMany({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: EXPORT_BATCH_SIZE,
        ...buildCursorQuery(cursor),
        include: {
          roles: true,
          tier: { select: { name: true } },
          organizationAccount: { select: { name: true } },
        },
      });
      if (batch.length === 0) break;
      assertAllRowsBelongToOrg(batch, staff.orgId, "exportMembersCsv");
      for (const m of batch) {
        lines.push(
          [
            m.id,
            escapeCsv(m.firstName),
            escapeCsv(m.lastName),
            escapeCsv(m.email ?? ""),
            escapeCsv(m.phone ?? ""),
            m.status,
            escapeCsv(m.company ?? ""),
            escapeCsv(m.jobTitle ?? ""),
            escapeCsv(m.tier?.name ?? ""),
            m.renewalDueAt ? m.renewalDueAt.toISOString().slice(0, 10) : "",
            escapeCsv(m.organizationAccount?.name ?? ""),
            m.joinedAt.toISOString().slice(0, 10),
            escapeCsv(memberTagsArray(m.tags).join("|")),
            escapeCsv(summarizeMemberRoles(m.roles)),
          ].join(","),
        );
        count += 1;
      }
      cursor = batch[batch.length - 1]?.id;
      if (batch.length < EXPORT_BATCH_SIZE) break;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.exported",
      entity: "Member",
      diff: { count },
    });

    return { ok: true, data: { csv: lines.join("\n"), count } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type MemberListRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  tags: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type GetMembersInput = {
  cursor?: string;
  take?: number;
  q?: string;
  status?: "ACTIVE" | "INACTIVE" | "LAPSED";
  statuses?: Array<"ACTIVE" | "INACTIVE" | "LAPSED">;
  orderBy?: "name" | "status" | "joinDate";
  orderDir?: "asc" | "desc";
};

/** Cursor-based member directory — scales to large orgs. */
export async function getMembers(
  raw: GetMembersInput,
  orgSlug?: string,
): Promise<
  ActionResult<{
    members: MemberListRow[];
    nextCursor: string | null;
    totalCount: number;
  }>
> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);

    const statusFilter =
      raw.statuses && raw.statuses.length > 0
        ? { status: { in: raw.statuses } }
        : raw.status
          ? { status: raw.status }
          : {};

    const searchFilter = buildMemberSearchFilter(raw.q);
    const where = {
      ...statusFilter,
      ...(searchFilter ?? {}),
    };

    const orderDir: Prisma.SortOrder = raw.orderDir === "desc" ? "desc" : "asc";
    const orderBy: Prisma.MemberOrderByWithRelationInput[] =
      raw.orderBy === "status"
        ? [{ status: orderDir }, { id: "asc" }]
        : raw.orderBy === "joinDate"
          ? [{ createdAt: orderDir }, { id: "asc" }]
          : [{ lastName: orderDir }, { firstName: orderDir }, { id: "asc" }];

    const [totalCount, rows] = await Promise.all([
      db.member.count({ where }),
      db.member.findMany({
        where,
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        orderBy,
        select: {
          id: true,
          orgId: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getMembers");
    const { items, nextCursor } = paginateSlice(rows, take);

    return {
      ok: true,
      data: {
        members: items,
        nextCursor,
        totalCount,
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

