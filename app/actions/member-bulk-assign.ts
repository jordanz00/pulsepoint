"use server";

/**
 * Bulk assign members to a hospital / facility account (MemberCore roster).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { requireCapability } from "@/lib/permissions";

const bulkAssignSchema = z.object({
  memberIds: z.array(z.string().cuid()).min(1).max(200),
  organizationAccountId: z.string().cuid(),
});

export async function bulkAssignMembersToHospital(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ updated: number }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = bulkAssignSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid bulk assign request" };

    const db = getOrgDb(staff.orgId);
    const facility = await db.memberOrganization.findFirst({
      where: { id: parsed.data.organizationAccountId, orgId: staff.orgId },
      select: { id: true, name: true },
    });
    if (!facility) return { ok: false, error: "Facility account not found" };

    const members = await db.member.findMany({
      where: { orgId: staff.orgId, id: { in: parsed.data.memberIds } },
      select: { id: true },
    });
    if (members.length === 0) return { ok: false, error: "No matching members" };

    const result = await db.member.updateMany({
      where: {
        orgId: staff.orgId,
        id: { in: members.map((m) => m.id) },
      },
      data: { organizationAccountId: facility.id },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.bulk_assign_facility",
      entity: "MemberOrganization",
      entityId: facility.id,
      diff: { memberCount: result.count, memberIds: members.map((m) => m.id) },
    });

    revalidatePath(`/${orgSlug}/members`);
    revalidatePath(`/${orgSlug}/enterprise/organizations`);
    return { ok: true, data: { updated: result.count } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
