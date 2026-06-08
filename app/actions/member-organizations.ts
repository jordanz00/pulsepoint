"use server";

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { memberOrganizationInputSchema } from "@/lib/validations/member-organization";
import type { ActionResult } from "@/app/actions/members";

function parseBedCount(raw: unknown): number | null {
  if (raw === "" || raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

export async function createMemberOrganization(
  raw: unknown,
  orgSlug: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberOrganizationInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid account data" };

    const db = getOrgDb(staff.orgId);
    const input = parsed.data;

    if (input.parentId) {
      const parent = await db.memberOrganization.findFirst({
        where: { id: input.parentId, orgId: staff.orgId },
      });
      if (!parent) return { ok: false, error: "Parent account not found" };
    }

    const account = await db.memberOrganization.create({
      data: {
        orgId: staff.orgId,
        name: input.name,
        type: input.type,
        parentId: input.parentId || null,
        region: input.region || null,
        bedCount: parseBedCount(input.bedCount),
        ownership: input.ownership || null,
        membershipLevel: input.membershipLevel || null,
        participationLevel: input.participationLevel || null,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member_organization.created",
      entity: "MemberOrganization",
      entityId: account.id,
    });

    revalidatePath(`/${orgSlug}/enterprise/organizations`);
    return { ok: true, data: { id: account.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateMemberOrganization(
  accountId: string,
  raw: unknown,
  orgSlug: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberOrganizationInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid account data" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.memberOrganization.findFirst({
      where: { id: accountId, orgId: staff.orgId },
    });
    if (!existing) return { ok: false, error: "Account not found" };

    const input = parsed.data;
    if (input.parentId && input.parentId === accountId) {
      return { ok: false, error: "Account cannot be its own parent" };
    }
    if (input.parentId) {
      const parent = await db.memberOrganization.findFirst({
        where: { id: input.parentId, orgId: staff.orgId },
      });
      if (!parent) return { ok: false, error: "Parent account not found" };
    }

    await db.memberOrganization.update({
      where: { id: accountId },
      data: {
        name: input.name,
        type: input.type,
        parentId: input.parentId || null,
        region: input.region || null,
        bedCount: parseBedCount(input.bedCount),
        ownership: input.ownership || null,
        membershipLevel: input.membershipLevel || null,
        participationLevel: input.participationLevel || null,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member_organization.updated",
      entity: "MemberOrganization",
      entityId: accountId,
    });

    revalidatePath(`/${orgSlug}/enterprise/organizations`);
    revalidatePath(`/${orgSlug}/enterprise/organizations/${accountId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteMemberOrganization(
  accountId: string,
  orgSlug: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:delete", { orgSlug });
    const db = getOrgDb(staff.orgId);

    const existing = await db.memberOrganization.findFirst({
      where: { id: accountId, orgId: staff.orgId },
      include: { _count: { select: { members: true, children: true } } },
    });
    if (!existing) return { ok: false, error: "Account not found" };

    if (existing._count.children > 0) {
      return {
        ok: false,
        error: "Remove or reassign subsidiary accounts before deleting this parent.",
      };
    }
    if (existing._count.members > 0) {
      return {
        ok: false,
        error: "Reassign members off this account before deleting.",
      };
    }

    await db.memberOrganization.delete({ where: { id: accountId } });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member_organization.deleted",
      entity: "MemberOrganization",
      entityId: accountId,
    });

    revalidatePath(`/${orgSlug}/enterprise/organizations`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
