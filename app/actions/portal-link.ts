"use server";

/**
 * Staff portal linking — manually connect or disconnect Member.clerkUserId.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { writeAuditLog } from "@/lib/audit";
import { getOrgDb, prisma } from "@/lib/db";
import {
  clerkUserIdTakenInOrg,
  normalizeMemberEmail,
} from "@/lib/portal/link-portal-member";
import { requireCapability } from "@/lib/permissions";
import { z } from "zod";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const manualLinkSchema = z.object({
  memberId: z.string().min(1).max(64),
  clerkUserId: z.string().min(1).max(128),
});

export async function linkMemberPortalAccount(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = manualLinkSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid link request" };

    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({
      where: { id: parsed.data.memberId, orgId: staff.orgId },
    });
    if (!member) return { ok: false, error: "Member not found" };

    if (
      await clerkUserIdTakenInOrg(
        db,
        staff.orgId,
        parsed.data.clerkUserId,
        member.id,
      )
    ) {
      return {
        ok: false,
        error: "That sign-in is already linked to another member in this org.",
      };
    }

    await db.member.update({
      where: { id: member.id },
      data: { clerkUserId: parsed.data.clerkUserId },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "portal.member.linked.manual",
      entity: "Member",
      entityId: member.id,
      diff: { clerkUserId: parsed.data.clerkUserId },
    });

    revalidatePath(`/${orgSlug}/members/${member.id}`);
    revalidatePath(`/${orgSlug}/portal`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function unlinkMemberPortalAccount(
  orgSlug: string,
  memberId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({
      where: { id: memberId, orgId: staff.orgId },
    });
    if (!member) return { ok: false, error: "Member not found" };
    if (!member.clerkUserId) return { ok: false, error: "No portal link on file" };

    const previous = member.clerkUserId;
    await db.member.update({
      where: { id: member.id },
      data: { clerkUserId: null },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "portal.member.unlinked",
      entity: "Member",
      entityId: member.id,
      diff: { clerkUserId: previous },
    });

    revalidatePath(`/${orgSlug}/members/${member.id}`);
    revalidatePath(`/${orgSlug}/portal`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Staff-triggered email match (same rules as auto-link). */
export async function linkMemberPortalByEmail(
  orgSlug: string,
  memberId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({
      where: { id: memberId, orgId: staff.orgId },
    });
    if (!member?.email) {
      return { ok: false, error: "Member has no email on file" };
    }

    const norm = normalizeMemberEmail(member.email);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: norm }, { email: member.email }],
      },
    });
    if (!user) {
      return {
        ok: false,
        error: "No signed-in user with this email yet. Member must sign up first.",
      };
    }

    if (member.clerkUserId === user.id) return { ok: true };

    if (await clerkUserIdTakenInOrg(db, staff.orgId, user.id, member.id)) {
      return {
        ok: false,
        error: "That sign-in is already linked to another member in this org.",
      };
    }

    await db.member.update({
      where: { id: member.id },
      data: { clerkUserId: user.id },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "portal.member.linked.email",
      entity: "Member",
      entityId: member.id,
      diff: { clerkUserId: user.id, email: member.email },
    });

    revalidatePath(`/${orgSlug}/members/${member.id}`);
    revalidatePath(`/${orgSlug}/portal`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
