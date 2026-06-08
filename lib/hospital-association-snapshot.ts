/**
 * Hospital association snapshot — live tenant rollups for executive surfaces.
 * Combines MemberCore hospital accounts, advocacy, governance, and emergency data.
 */

import { getOrgDb } from "@/lib/db";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";

export type HospitalAssociationSnapshot = {
  hospitalAccounts: number;
  membersOnHospitalRoster: number;
  hospitalEngagementPct: number;
  hospitalsWithTakeActionResponse: number;
  activeAdvocacyIssues: number;
  activeCampaigns: number;
  committeeCount: number;
  emergencyContactCount: number;
  integrationCount: number;
};

export async function loadHospitalAssociationSnapshot(
  orgId: string,
): Promise<HospitalAssociationSnapshot> {
  const db = getOrgDb(orgId);

  const [
    advocacy,
    activeAdvocacyIssues,
    activeCampaigns,
    committeeCount,
    emergencyContactCount,
    integrationCount,
  ] = await Promise.all([
    loadAdvocacyDashboardStats(orgId),
    db.advocacyIssue.count({
      where: { orgId, status: { in: ["ACTIVE", "TRACKING"] } },
    }),
    db.advocacyCampaign.count({ where: { orgId, isActive: true } }),
    db.committee.count({ where: { orgId, isActive: true } }),
    db.emergencyContact.count({ where: { orgId } }),
    db.integrationConnection.count({ where: { orgId } }),
  ]);

  return {
    hospitalAccounts: advocacy.hospitalAccounts,
    membersOnHospitalRoster: advocacy.membersOnHospitalRoster,
    hospitalEngagementPct: advocacy.hospitalEngagementPct,
    hospitalsWithTakeActionResponse: advocacy.hospitalsWithTakeActionResponse,
    activeAdvocacyIssues,
    activeCampaigns,
    committeeCount,
    emergencyContactCount,
    integrationCount,
  };
}
