"use server";

/**
 * MemberRole server actions — leadership, C-suite, and external board affiliations.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { memberRoleInputSchema } from "@/lib/validations/member-role";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function parseOptionalDate(raw: string | undefined): Date | null {
  const s = raw?.trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createMemberRole(
  memberId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult<{ roleId: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberRoleInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid role data" };

    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Member not found" };

    const input = parsed.data;
    if (
      input.scope === "EXTERNAL_ORGANIZATION" &&
      !input.organizationName?.trim()
    ) {
      return {
        ok: false,
        error: "Organization name is required for external roles",
      };
    }

    const role = await db.memberRole.create({
      data: {
        orgId: staff.orgId,
        memberId,
        category: input.category,
        scope: input.scope,
        leadershipLevel: input.leadershipLevel ?? null,
        title: input.title,
        organizationName: input.organizationName?.trim() || null,
        isCurrent: input.isCurrent ?? true,
        startDate: parseOptionalDate(input.startDate),
        endDate: parseOptionalDate(input.endDate),
        notes: input.notes?.trim() || null,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.role.created",
      entity: "MemberRole",
      entityId: role.id,
      diff: { memberId, title: input.title },
    });

    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true, data: { roleId: role.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateMemberRole(
  roleId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberRoleInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid role data" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.memberRole.findFirst({ where: { id: roleId } });
    if (!existing) return { ok: false, error: "Role not found" };

    const input = parsed.data;
    if (
      input.scope === "EXTERNAL_ORGANIZATION" &&
      !input.organizationName?.trim()
    ) {
      return {
        ok: false,
        error: "Organization name is required for external roles",
      };
    }

    await db.memberRole.update({
      where: { id: roleId },
      data: {
        category: input.category,
        scope: input.scope,
        leadershipLevel: input.leadershipLevel ?? null,
        title: input.title,
        organizationName: input.organizationName?.trim() || null,
        isCurrent: input.isCurrent ?? true,
        startDate: parseOptionalDate(input.startDate),
        endDate: parseOptionalDate(input.endDate),
        notes: input.notes?.trim() || null,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.role.updated",
      entity: "MemberRole",
      entityId: roleId,
    });

    revalidatePath(`/${staff.orgSlug}/members/${existing.memberId}`);
    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteMemberRole(
  roleId: string,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const existing = await db.memberRole.findFirst({ where: { id: roleId } });
    if (!existing) return { ok: false, error: "Role not found" };

    await db.memberRole.delete({ where: { id: roleId } });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.role.deleted",
      entity: "MemberRole",
      entityId: roleId,
    });

    revalidatePath(`/${staff.orgSlug}/members/${existing.memberId}`);
    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
