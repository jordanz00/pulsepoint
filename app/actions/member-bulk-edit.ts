"use server";

/**
 * Bulk edit members — Nimble-style find/replace across selected contacts.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import {
  computeMemberBulkUpdate,
  previewBulkEdit,
} from "@/lib/crm/member-bulk-edit";
import { memberBulkEditSchema } from "@/lib/validations/member-bulk-edit";
import type { ActionResult } from "@/app/actions/members";

export async function previewMemberBulkEdit(
  raw: unknown,
  orgSlug?: string,
): Promise<
  ActionResult<{
    wouldUpdate: number;
    skipped: number;
    sample: Array<{ id: string; name: string; before: string; after: string }>;
  }>
> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberBulkEditSchema.safeParse({ ...(raw as object), dryRun: true });
    if (!parsed.success) {
      return { ok: false, error: "Invalid bulk edit parameters" };
    }

    const db = getOrgDb(staff.orgId);
    const members = await db.member.findMany({
      where: { id: { in: parsed.data.memberIds } },
    });
    assertAllRowsBelongToOrg(members, staff.orgId, "bulkEditPreview");

    if (members.length !== parsed.data.memberIds.length) {
      return { ok: false, error: "Some selected members were not found" };
    }

    const preview = previewBulkEdit(members, parsed.data);
    return { ok: true, data: preview };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function applyMemberBulkEdit(
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult<{ updated: number; skipped: number }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberBulkEditSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid bulk edit parameters" };
    }

    const db = getOrgDb(staff.orgId);
    const members = await db.member.findMany({
      where: { id: { in: parsed.data.memberIds } },
    });
    assertAllRowsBelongToOrg(members, staff.orgId, "bulkEditApply");

    if (members.length !== parsed.data.memberIds.length) {
      return { ok: false, error: "Some selected members were not found" };
    }

    // Email uniqueness when bulk-setting email
    if (parsed.data.field === "email" && parsed.data.action !== "remove") {
      const newEmail = parsed.data.replaceValue?.trim().toLowerCase();
      if (newEmail) {
        const dupe = await db.member.findFirst({
          where: {
            email: newEmail,
            id: { notIn: parsed.data.memberIds },
          },
        });
        if (dupe) {
          return {
            ok: false,
            error: "That email is already used by another member in this organization",
          };
        }
      }
    }

    let updated = 0;
    let skipped = 0;

    for (const member of members) {
      const result = computeMemberBulkUpdate(member, parsed.data);
      if (!result.changed || !result.data) {
        skipped += 1;
        continue;
      }

      if (parsed.data.field === "email" && result.data.email) {
        const email = String(result.data.email).toLowerCase();
        const dupe = await db.member.findFirst({
          where: { email, id: { not: member.id } },
        });
        if (dupe) {
          skipped += 1;
          continue;
        }
        result.data.email = email;
      }

      await db.member.update({
        where: { id: member.id },
        data: result.data,
      });
      updated += 1;
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.bulk_edit",
      entity: "Member",
      entityId: "bulk",
      diff: {
        field: parsed.data.field,
        action: parsed.data.action,
        findMode: parsed.data.findMode,
        selected: parsed.data.memberIds.length,
        updated,
        skipped,
      },
    });

    revalidatePath(`/${staff.orgSlug}/members`);
    return { ok: true, data: { updated, skipped } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
