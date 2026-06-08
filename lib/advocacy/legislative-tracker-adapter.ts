/**
 * Legislative tracker adapter (BL-027 slice) — pulls from org advocacy issues when no vendor feed.
 *
 * Future: vendor webhooks map into AdvocacyIssue rows. Until then, issues with bill numbers
 * are the honest "legislative feed" for demo orgs.
 */

import { getOrgDb } from "@/lib/db";

export type LegislativeBillStub = {
  externalId: string;
  title: string;
  jurisdiction: "STATE" | "FEDERAL";
  billNumber: string | null;
  status: string;
  lastSyncedAt: string | null;
  source: "vendor_feed" | "advocacy_issue";
};

export type LegislativeTrackerAdapterStatus = "adapter_ready" | "not_configured";

export function getLegislativeTrackerAdapterStatus(): LegislativeTrackerAdapterStatus {
  return "adapter_ready";
}

/** Vendor feed placeholder — empty until IT connects. */
export async function fetchLegislativeBillsFromVendor(_orgId: string): Promise<LegislativeBillStub[]> {
  return [];
}

/** Maps advocacy issues with bill numbers — no invented external bills. */
export async function fetchLegislativeBillsForOrg(orgId: string): Promise<LegislativeBillStub[]> {
  const vendor = await fetchLegislativeBillsFromVendor(orgId);
  if (vendor.length > 0) return vendor;

  const db = getOrgDb(orgId);
  const issues = await db.advocacyIssue.findMany({
    where: { orgId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return issues
    .filter((i) => i.billNumber)
    .map((i) => ({
      externalId: i.id,
      title: i.title,
      jurisdiction: i.jurisdiction.toLowerCase() === "federal" ? "FEDERAL" : "STATE",
      billNumber: i.billNumber,
      status: i.status,
      lastSyncedAt: i.updatedAt.toISOString(),
      source: "advocacy_issue" as const,
    }));
}
