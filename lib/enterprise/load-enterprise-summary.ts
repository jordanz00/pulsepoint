import { getOrgDb } from "@/lib/db";
import {
  ASSOCIATION_DEPARTMENTS,
  ASSOCIATION_DEPARTMENT_IDS,
  ENTERPRISE_MODULES,
  INTEGRATION_REGISTRY,
} from "@/lib/association";

export async function loadEnterpriseSummary(orgId: string) {
  const db = getOrgDb(orgId);

  const [
    memberOrgCount,
    committeeCount,
    advocacyIssueCount,
    emergencyContactCount,
    integrationCount,
    memberCount,
  ] = await Promise.all([
    db.memberOrganization.count({ where: { orgId } }),
    db.committee.count({ where: { orgId, isActive: true } }),
    db.advocacyIssue.count({ where: { orgId } }),
    db.emergencyContact.count({ where: { orgId } }),
    db.integrationConnection.count({ where: { orgId } }),
    db.member.count({ where: { orgId } }),
  ]);

  const phaseCounts = {
    live: ENTERPRISE_MODULES.filter((m) => m.phase === "live").length,
    alpha: ENTERPRISE_MODULES.filter((m) => m.phase === "alpha").length,
    foundation: ENTERPRISE_MODULES.filter((m) => m.phase === "foundation").length,
    roadmap: ENTERPRISE_MODULES.filter((m) => m.phase === "roadmap").length,
  };

  return {
    departments: ASSOCIATION_DEPARTMENT_IDS.map((id) => ASSOCIATION_DEPARTMENTS[id]),
    modules: ENTERPRISE_MODULES,
    integrations: INTEGRATION_REGISTRY,
    phaseCounts,
    stats: {
      memberOrgCount,
      committeeCount,
      advocacyIssueCount,
      emergencyContactCount,
      integrationCount,
      memberCount,
    },
  };
}
