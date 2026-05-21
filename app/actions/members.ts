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
import {
  memberInputSchema,
  memberSearchSchema,
} from "@/lib/validations/member";

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
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
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
        tags: input.tags ?? [],
        customFields: (input.customFields ?? {}) as Prisma.InputJsonValue,
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
        tags: input.tags ?? existing.tags,
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
): Promise<ActionResult<{ csv: string }>> {
  try {
    const staff = await requireCapability("member:export", { orgSlug });
    const members = await fetchMembers(staff.orgId, {});
    const header = "id,firstName,lastName,email,phone,status,joinedAt,tags";
    const rows = members.map((m) =>
      [
        m.id,
        escapeCsv(m.firstName),
        escapeCsv(m.lastName),
        escapeCsv(m.email ?? ""),
        escapeCsv(m.phone ?? ""),
        m.status,
        m.joinedAt.toISOString(),
        escapeCsv(m.tags.join("|")),
      ].join(","),
    );
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.exported",
      entity: "Member",
      diff: { count: members.length },
    });

    return { ok: true, data: { csv: [header, ...rows].join("\n") } };
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

