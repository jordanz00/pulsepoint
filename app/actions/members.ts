"use server";

/**
 * Member CRM server actions — PulseCore Phase 1
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaffSession } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import {
  memberInputSchema,
  memberSearchSchema,
} from "@/lib/validations/member";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function listMembers(
  raw: unknown,
): Promise<ActionResult<{ members: Awaited<ReturnType<typeof fetchMembers>> }>> {
  try {
    const staff = await requireStaffSession();
    const parsed = memberSearchSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid search parameters" };
    }
    const members = await fetchMembers(staff.orgId, parsed.data);
    return { ok: true, data: { members } };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

async function fetchMembers(
  orgId: string,
  filters: { q?: string; status?: "ACTIVE" | "INACTIVE" | "LAPSED" },
) {
  const db = getOrgDb(orgId);
  const q = filters.q?.trim();

  return db.member.findMany({
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
}

export async function getMember(
  memberId: string,
): Promise<ActionResult<{ member: NonNullable<Awaited<ReturnType<typeof fetchOneMember>>> }>> {
  try {
    const staff = await requireStaffSession();
    const member = await fetchOneMember(staff.orgId, memberId);
    if (!member) return { ok: false, error: "Member not found" };
    return { ok: true, data: { member } };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

async function fetchOneMember(orgId: string, memberId: string) {
  const db = getOrgDb(orgId);
  return db.member.findFirst({ where: { id: memberId } });
}

export async function createMember(
  raw: unknown,
): Promise<ActionResult<{ memberId: string }>> {
  try {
    const staff = await requireStaffSession();
    const parsed = memberInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid member data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;

    const member = await db.member.create({
      data: {
        orgId: staff.orgId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
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
  } catch {
    return { ok: false, error: "Could not create member" };
  }
}

export async function updateMember(
  memberId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireStaffSession();
    const parsed = memberInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid member data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;

    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    await db.member.update({
      where: { id: memberId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
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
  } catch {
    return { ok: false, error: "Could not update member" };
  }
}

export async function deleteMember(memberId: string): Promise<ActionResult> {
  try {
    const staff = await requireStaffSession();
    const db = getOrgDb(staff.orgId);
    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    await db.member.delete({ where: { id: memberId } });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.deleted",
      entity: "Member",
      entityId: memberId,
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete member" };
  }
}

export async function exportMembersCsv(): Promise<ActionResult<{ csv: string }>> {
  try {
    const staff = await requireStaffSession();
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
    return { ok: true, data: { csv: [header, ...rows].join("\n") } };
  } catch {
    return { ok: false, error: "Export failed" };
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function importMembersCsv(
  csvText: string,
): Promise<ActionResult<{ imported: number }>> {
  try {
    const staff = await requireStaffSession();
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return { ok: false, error: "CSV must include a header row and at least one member" };
    }

    const header = lines[0]!.toLowerCase();
    const cols = header.split(",").map((c) => c.trim());
    const fnIdx = cols.indexOf("firstname");
    const lnIdx = cols.indexOf("lastname");
    const emailIdx = cols.indexOf("email");

    if (fnIdx === -1 || lnIdx === -1) {
      return { ok: false, error: "CSV must include firstName and lastName columns" };
    }

    const db = getOrgDb(staff.orgId);
    let imported = 0;

    for (const line of lines.slice(1)) {
      const parts = parseCsvLine(line);
      const firstName = parts[fnIdx]?.trim();
      const lastName = parts[lnIdx]?.trim();
      if (!firstName || !lastName) continue;

      const email =
        emailIdx >= 0 ? parts[emailIdx]?.trim() || null : null;

      await db.member.create({
        data: {
          orgId: staff.orgId,
          firstName,
          lastName,
          email,
          status: "ACTIVE",
          tags: [],
          customFields: {} as Prisma.InputJsonValue,
        },
      });
      imported += 1;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.imported",
      entity: "Member",
      diff: { count: imported },
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true, data: { imported } };
  } catch {
    return { ok: false, error: "Import failed" };
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
