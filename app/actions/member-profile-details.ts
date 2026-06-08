"use server";

import { revalidatePath } from "next/cache";
import {
  memberAddressSchema,
  memberBillingSchema,
  memberCommPrefsSchema,
  mergeExtendedIntoCustomFields,
} from "@/lib/member-profile/extended-fields";
import { getOrgDb } from "@/lib/db";
import { requireCapability } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import type { Prisma } from "@/app/generated/prisma/client";

export async function updateMemberProfileDetails(
  memberId: string,
  orgSlug: string,
  input: {
    address?: Record<string, unknown>;
    billing?: Record<string, unknown>;
    communicationPreferences?: Record<string, unknown>;
    otherDetails?: string;
    credentials?: string;
    licenseState?: string;
  },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    const address = input.address
      ? memberAddressSchema.safeParse(input.address)
      : null;
    if (address && !address.success) {
      return { ok: false, error: "Invalid address" };
    }
    const billing = input.billing
      ? memberBillingSchema.safeParse(input.billing)
      : null;
    if (billing && !billing.success) {
      return { ok: false, error: "Invalid billing details" };
    }
    const comm = input.communicationPreferences
      ? memberCommPrefsSchema.safeParse(input.communicationPreferences)
      : null;
    if (comm && !comm.success) {
      return { ok: false, error: "Invalid communication preferences" };
    }

    const customFields = mergeExtendedIntoCustomFields(existing.customFields, {
      address: address?.data,
      billing: billing?.data,
      communicationPreferences: comm?.data,
      otherDetails: input.otherDetails,
      credentials: input.credentials,
      licenseState: input.licenseState,
    });

    await db.member.update({
      where: { id: memberId },
      data: { customFields: customFields as Prisma.InputJsonValue },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.profile_details.updated",
      entity: "Member",
      entityId: memberId,
    });

    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
