/**
 * Public advocacy take-action submit — validated, tenant-scoped, deduped by email per campaign.
 */

import { Prisma } from "@/app/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { getOrgDb } from "@/lib/db";
import {
  advocacyTakeActionInputSchema,
  type AdvocacyTakeActionInput,
} from "@/lib/validations/advocacy-take-action";

export type SubmitTakeActionResult =
  | { ok: true; responseCount: number; duplicate: false }
  | { ok: true; responseCount: number; duplicate: true }
  | { ok: false; error: string };

export async function submitTakeActionResponse(
  orgId: string,
  campaignId: string,
  raw: unknown,
): Promise<SubmitTakeActionResult> {
  const parsed = advocacyTakeActionInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const db = getOrgDb(orgId);
  const campaign = await db.advocacyCampaign.findFirst({
    where: {
      id: campaignId,
      orgId,
      isActive: true,
      audienceId: { not: null },
    },
  });
  if (!campaign) {
    return { ok: false, error: "This take-action campaign is not available." };
  }

  const input = normalizeTakeActionInput(parsed.data);
  const memberOrganizationId = await resolveHospitalAccount(db, orgId, input);

  try {
    await db.advocacyCampaignResponse.create({
      data: {
        orgId,
        campaignId: campaign.id,
        memberOrganizationId,
        hospitalName: input.hospitalName,
        responderName: input.responderName,
        responderEmail: input.responderEmail,
        responderTitle: input.responderTitle || null,
        position: input.position,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: true,
        responseCount: campaign.responseCount,
        duplicate: true,
      };
    }
    throw e;
  }

  const target = campaign.targetCount > 0 ? campaign.targetCount : 1_000_000;
  const nextCount = Math.min(campaign.responseCount + 1, target);
  const updated = await db.advocacyCampaign.update({
    where: { id: campaign.id },
    data: { responseCount: nextCount },
  });

  await writeAuditLog({
    orgId,
    userId: null,
    action: "advocacy.response.public",
    entity: "AdvocacyCampaignResponse",
    entityId: campaign.id,
    diff: {
      campaignId: campaign.id,
      hospitalName: input.hospitalName,
      position: input.position,
      responderEmail: input.responderEmail,
      duplicate: false,
    },
  });

  return { ok: true, responseCount: updated.responseCount, duplicate: false };
}

function normalizeTakeActionInput(data: AdvocacyTakeActionInput) {
  return {
    responderName: data.responderName.trim(),
    responderEmail: data.responderEmail.trim().toLowerCase(),
    responderTitle: (data.responderTitle ?? "").trim(),
    hospitalName: data.hospitalName.trim(),
    memberOrganizationId: (data.memberOrganizationId ?? "").trim() || null,
    position: data.position,
  };
}

async function resolveHospitalAccount(
  db: ReturnType<typeof getOrgDb>,
  orgId: string,
  input: ReturnType<typeof normalizeTakeActionInput>,
): Promise<string | null> {
  if (input.memberOrganizationId) {
    const org = await db.memberOrganization.findFirst({
      where: { id: input.memberOrganizationId, orgId },
      select: { id: true, name: true },
    });
    if (!org) return null;
    return org.id;
  }
  return null;
}
