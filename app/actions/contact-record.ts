"use server";

/**
 * Nimble-style contact record — inline edits and quick actions.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { relationshipHealthSchema } from "@/lib/validations/crm";
import type { InlineEditableField } from "@/lib/contact-record/types";
import type { ActionResult } from "@/app/actions/members";

const inlineFieldSchema = z.object({
  field: z.enum([
    "firstName",
    "lastName",
    "email",
    "phone",
    "company",
    "jobTitle",
    "linkedInUrl",
    "websiteUrl",
    "relationshipHealth",
  ]),
  value: z.string().max(500),
});

function memberRevalidate(orgSlug: string, memberId: string) {
  revalidatePath(`/${orgSlug}/members/${memberId}`);
}

export async function updateContactRecordField(
  orgSlug: string,
  memberId: string,
  field: InlineEditableField,
  value: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = inlineFieldSchema.safeParse({ field, value });
    if (!parsed.success) return { ok: false, error: "Invalid field" };

    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Contact not found" };

    const v = parsed.data.value.trim();
    const data: Prisma.MemberUpdateInput = {};

    switch (parsed.data.field) {
      case "firstName":
        if (!v) return { ok: false, error: "First name required" };
        data.firstName = v.slice(0, 100);
        break;
      case "lastName":
        if (!v) return { ok: false, error: "Last name required" };
        data.lastName = v.slice(0, 100);
        break;
      case "email":
        data.email = v ? v.toLowerCase().slice(0, 254) : null;
        break;
      case "phone":
        data.phone = v ? v.slice(0, 30) : null;
        break;
      case "company":
        data.company = v ? v.slice(0, 200) : null;
        break;
      case "jobTitle":
        data.jobTitle = v ? v.slice(0, 120) : null;
        break;
      case "linkedInUrl":
        if (v && !v.startsWith("http")) return { ok: false, error: "URL must start with http" };
        data.linkedInUrl = v ? v.slice(0, 500) : null;
        break;
      case "websiteUrl":
        if (v && !v.startsWith("http")) return { ok: false, error: "URL must start with http" };
        data.websiteUrl = v ? v.slice(0, 500) : null;
        break;
      case "relationshipHealth": {
        const h = relationshipHealthSchema.safeParse(v);
        if (!h.success) return { ok: false, error: "Invalid health value" };
        data.relationshipHealth = h.data;
        break;
      }
    }

    await db.member.update({ where: { id: memberId }, data });
    memberRevalidate(staff.orgSlug, memberId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateContactFollowUp(
  orgSlug: string,
  memberId: string,
  isoOrPreset: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);

    let due: Date | null = null;
    const now = Date.now();
    if (isoOrPreset === "7d") due = new Date(now + 7 * 86400000);
    else if (isoOrPreset === "30d") due = new Date(now + 30 * 86400000);
    else if (isoOrPreset === "90d") due = new Date(now + 90 * 86400000);
    else if (isoOrPreset === "clear") due = null;
    else {
      const d = new Date(isoOrPreset);
      if (Number.isNaN(d.getTime())) return { ok: false, error: "Invalid date" };
      due = d;
    }

    await db.member.update({
      where: { id: memberId },
      data: { nextFollowUpAt: due, lastTouchAt: new Date() },
    });
    memberRevalidate(staff.orgSlug, memberId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
