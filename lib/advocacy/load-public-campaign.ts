/**
 * Public advocacy campaign loader — only launched, active campaigns.
 */

import { getOrgDb } from "@/lib/db";

export type PublicAdvocacyCampaign = {
  id: string;
  name: string;
  targetCount: number;
  responseCount: number;
  issueTitle: string | null;
  issueSummary: string | null;
  billNumber: string | null;
  jurisdiction: string | null;
};

export async function loadPublicAdvocacyCampaign(
  orgId: string,
  campaignId: string,
): Promise<PublicAdvocacyCampaign | null> {
  const db = getOrgDb(orgId);
  const row = await db.advocacyCampaign.findFirst({
    where: {
      id: campaignId,
      orgId,
      isActive: true,
      audienceId: { not: null },
    },
    include: {
      issue: { select: { title: true, summary: true, billNumber: true, jurisdiction: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    targetCount: row.targetCount,
    responseCount: row.responseCount,
    issueTitle: row.issue?.title ?? null,
    issueSummary: row.issue?.summary ?? null,
    billNumber: row.issue?.billNumber ?? null,
    jurisdiction: row.issue?.jurisdiction ?? null,
  };
}

export type PublicHospitalOption = { id: string; name: string };

export async function loadPublicHospitalOptions(orgId: string): Promise<PublicHospitalOption[]> {
  const db = getOrgDb(orgId);
  const rows = await db.memberOrganization.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 500,
  });
  return rows;
}
