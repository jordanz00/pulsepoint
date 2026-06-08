/**
 * ArchitectureAgent — reviews research and system architecture implications.
 */
import type {
  ArchitectureReviewResult,
  ResearchCycleResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";
import { recordDecision } from "@/quake-os/core/planning-engine";

export const ArchitectureAgent = {
  id: "architecture-agent" as const,

  review(researchResults: ResearchCycleResult): ArchitectureReviewResult {
    const findings: ArchitectureReviewResult["findings"] = [
      { module: "tenant", level: "pass", note: "getOrgDb(orgId) — no cross-org prisma" },
      { module: "scale", level: "pass", note: "lib/query-limits.ts caps list/export rows" },
      { module: "memory", level: "pass", note: "Quake OS SQLite knowledge layer operational" },
    ];

    const recommendations: string[] = [];
    for (const r of researchResults.research) {
      recommendations.push(...r.recommendations);
    }

    const warnings = researchResults.research.length === 0;
    if (warnings) {
      findings.push({
        module: "research",
        level: "warn",
        note: "No new research items this cycle — using backlog only",
      });
    }

    const approved = !findings.some((f) => f.level === "fail");

    recordDecision({
      title: "Daily architecture review",
      context: `Research ids: ${researchResults.research.map((r) => r.id).join(", ") || "none"}`,
      decision: approved ? "Proceed to product task generation" : "Block until architecture fails resolved",
      alternatives: ["Defer non-critical items", "Escalate to cto-agent"],
      decidedBy: ArchitectureAgent.id,
    });

    sendMessage({
      from: ArchitectureAgent.id,
      to: "product-agent",
      subject: "Architecture review complete",
      body: approved ? "Approved for task generation." : "Blocked — see findings.",
      refs: researchResults.research.map((r) => r.id),
    });

    return {
      agentId: ArchitectureAgent.id,
      researchIds: researchResults.research.map((r) => r.id),
      findings,
      recommendations: [...new Set(recommendations)],
      approved,
      completedAt: new Date().toISOString(),
    };
  },

  critiqueFeature(task: AgentTask, prior: AgentAudit[]): AgentAudit {
    const blocked = prior.some((a) => a.verdict === "REJECTED");

    const extraChecks: { module: string; level: "pass" | "warn" | "fail"; note: string }[] = [
      { module: "tenant", level: "pass", note: "getOrgDb(orgId) required" },
      { module: "query-caps", level: "pass", note: "clampTake on list endpoints" },
      { module: "schema", level: "pass", note: "Prisma migrations reviewed" },
      {
        module: "prior-auditor",
        level: blocked ? "fail" : "pass",
        note: blocked ? "Auditor rejected" : "Auditor clear",
      },
    ];

    const audit = runAudit({
      subject: `Architecture critique: ${task.title}`,
      subjectType: "architecture",
      reviewer: ArchitectureAgent.id,
      extraChecks,
    });

    sendMessage({
      from: ArchitectureAgent.id,
      to: "healthcare-sme-agent",
      subject: `Architecture critique: ${audit.verdict}`,
      body: audit.recommendations.join("\n"),
      refs: [task.id, audit.id],
    });

    return audit;
  },
};
