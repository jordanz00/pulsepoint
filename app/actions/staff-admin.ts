"use server";

/**
 * Staff access administration — role changes with audit trail.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { OrgRole } from "@/app/generated/prisma/client";
import { messageFromActionError } from "@/lib/action-errors";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/permissions";
import { canAssignRole } from "@/lib/staff/role-policy";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const roleSchema = z.enum(["STAFF", "ADMIN", "OWNER"]);

export async function updateStaffRole(
  orgSlug: string,
  membershipId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const parsed = roleSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid role" };

    const membership = await prisma.orgMembership.findFirst({
      where: { id: membershipId, orgId: staff.orgId },
    });
    if (!membership) return { ok: false, error: "Staff member not found" };
    if (membership.userId === staff.userId && parsed.data !== membership.role) {
      return { ok: false, error: "Change your own role from another owner account" };
    }

    const ownerCount = await prisma.orgMembership.count({
      where: { orgId: staff.orgId, role: "OWNER" },
    });

    const gate = canAssignRole(
      staff.role,
      membership.role,
      parsed.data as OrgRole,
      ownerCount,
    );
    if (!gate.ok) return { ok: false, error: gate.reason };

    if (parsed.data === membership.role) return { ok: true };

    await prisma.orgMembership.update({
      where: { id: membershipId },
      data: { role: parsed.data },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "staff.role.updated",
      entity: "OrgMembership",
      entityId: membershipId,
      diff: {
        userId: membership.userId,
        from: membership.role,
        to: parsed.data,
      },
    });

    revalidatePath(`/${orgSlug}/settings/staff`);
    revalidatePath(`/${orgSlug}/settings`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
