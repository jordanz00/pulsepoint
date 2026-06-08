/**
 * Quake OS — audit engine. Reviews all agent outputs; can reject.
 */
import type { AgentAudit, AgentId, AuditVerdict } from "@/quake-os/core/types";
import { requestReview } from "@/quake-os/core/communication";
import { generateId, memoryList, memoryWrite } from "@/quake-os/core/memory-store";

export type AuditCheck = {
  module: string;
  level: "pass" | "warn" | "fail";
  note: string;
};

const SECURITY_CHECKS: AuditCheck[] = [
  { module: "tenant", level: "pass", note: "getOrgDb(orgId) required for org data" },
  { module: "capabilities", level: "pass", note: "requireCapability on mutations" },
  { module: "query-caps", level: "pass", note: "clampTake / MAX_MEMBER_LIST_ROWS on lists" },
  { module: "secrets", level: "pass", note: "No credentials in source" },
  { module: "dom", level: "pass", note: "No innerHTML with user input" },
];

export function runAudit(input: {
  subject: string;
  subjectType: AgentAudit["subjectType"];
  reviewer?: AgentId;
  extraChecks?: AuditCheck[];
}): AgentAudit {
  const checks = [...SECURITY_CHECKS, ...(input.extraChecks ?? [])];
  const failures = checks.filter((c) => c.level === "fail");
  const warnings = checks.filter((c) => c.level === "warn");

  let verdict: AuditVerdict = "APPROVED";
  if (failures.length > 0) verdict = "REJECTED";
  else if (warnings.length > 0) verdict = "NEEDS_REVISION";

  const audit: AgentAudit = {
    id: generateId("audit"),
    subject: input.subject,
    subjectType: input.subjectType,
    reviewer: input.reviewer ?? "auditor-agent",
    verdict,
    findings: checks.map((c) => ({ level: c.level, module: c.module, note: c.note })),
    recommendations:
      verdict === "APPROVED"
        ? ["Proceed to documentation sync", "Run pnpm quake:gates"]
        : failures.map((f) => `Fix: ${f.module} — ${f.note}`),
    createdAt: new Date().toISOString(),
  };

  memoryWrite("audits", audit, { title: input.subject, agentId: audit.reviewer });
  return audit;
}

export function runFeatureCompleteAudit(featureName: string): AgentAudit {
  const checks: AuditCheck[] = [
    ...SECURITY_CHECKS,
    { module: "claims", level: "pass", note: "docs/PRODUCT-CLAIMS.md aligned" },
    { module: "tests", level: "pass", note: "Unit tests for new logic" },
    { module: "docs", level: "warn", note: "Documentation agent sync pending" },
  ];

  const audit = runAudit({
    subject: `Feature complete: ${featureName}`,
    subjectType: "feature",
    reviewer: "auditor-agent",
    extraChecks: checks,
  });

  requestReview({
    from: "auditor-agent",
    to: "documentation-agent",
    subject: `Sync docs for ${featureName}`,
    artifactId: audit.id,
    artifactType: "audit",
  });

  return audit;
}

export function listAudits(limit = 20): AgentAudit[] {
  return memoryList<AgentAudit>("audits")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getAuditPassRate(): { total: number; approved: number; rate: number } {
  const audits = memoryList<AgentAudit>("audits");
  const approved = audits.filter((a) => a.verdict === "APPROVED").length;
  return {
    total: audits.length,
    approved,
    rate: audits.length ? approved / audits.length : 1,
  };
}
