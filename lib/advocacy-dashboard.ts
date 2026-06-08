/**
 * Advocacy dashboard stats — hospital-association rollups from MemberCore (real tenant data).
 */

import { getOrgDb } from "@/lib/db";

export type AdvocacyDashboardStats = {
  hospitalAccounts: number;
  membersOnHospitalRoster: number;
  engagedHospitalAccounts: number;
  hospitalEngagementPct: number;
  emailsSentThisMonth: number;
  /** Distinct hospitals with a recorded take-action response (public form or staff). */
  hospitalsWithTakeActionResponse: number;
  takeActionResponsesThisMonth: number;
};

export async function loadAdvocacyDashboardStats(
  orgId: string,
): Promise<AdvocacyDashboardStats> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    hospitalAccounts,
    membersOnHospitalRoster,
    engagedHospitalRows,
    emailsSent,
    hospitalsWithTakeActionResponse,
    takeActionResponsesThisMonth,
  ] = await Promise.all([
      db.memberOrganization.count({ where: { orgId } }),
      db.member.count({
        where: { orgId, status: "ACTIVE", organizationAccountId: { not: null } },
      }),
      db.member.findMany({
        where: {
          orgId,
          status: "ACTIVE",
          organizationAccountId: { not: null },
          engagementTier: { in: ["active", "moderate"] },
        },
        select: { organizationAccountId: true },
        distinct: ["organizationAccountId"],
      }),
      db.emailSendLog.count({ where: { orgId, createdAt: { gte: monthStart } } }),
      db.advocacyCampaignResponse.findMany({
        where: { orgId, memberOrganizationId: { not: null } },
        select: { memberOrganizationId: true },
        distinct: ["memberOrganizationId"],
      }),
      db.advocacyCampaignResponse.count({
        where: { orgId, createdAt: { gte: monthStart } },
      }),
    ]);

  const engagedHospitalAccounts = engagedHospitalRows.filter(
    (r) => r.organizationAccountId != null,
  ).length;

  const hospitalEngagementPct =
    hospitalAccounts > 0
      ? Math.round((engagedHospitalAccounts / hospitalAccounts) * 100)
      : 0;

  return {
    hospitalAccounts,
    membersOnHospitalRoster,
    engagedHospitalAccounts,
    hospitalEngagementPct,
    emailsSentThisMonth: emailsSent,
    hospitalsWithTakeActionResponse: hospitalsWithTakeActionResponse.length,
    takeActionResponsesThisMonth,
  };
}
