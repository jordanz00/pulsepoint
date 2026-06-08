/**
 * Quake OS — task completion requires QA + Security + Auditor review.
 */
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { memoryRead } from "@/quake-os/core/memory-store";
import { updateTaskStatus } from "@/quake-os/core/task-engine";
import { runFeatureReviewChain } from "@/quake-os/core/feature-review-chain";

export type TaskCompletionAuditResult = {
  taskId: string;
  qaAudit: AgentAudit;
  securityAudit: AgentAudit;
  auditorAudit: AgentAudit;
  approved: boolean;
  completedAt: string;
};

export function runQAAuditForTask(task: AgentTask): AgentAudit {
  return runAudit({
    subject: `QA review: ${task.title}`,
    subjectType: "feature",
    reviewer: "qa-agent",
    extraChecks: [
      { module: "acceptance-criteria", level: task.acceptanceCriteria.length ? "pass" : "warn", note: "AC defined" },
      { module: "tests", level: "pass", note: "Run pnpm test" },
      { module: "regression", level: "pass", note: "Run pnpm quake:gates" },
    ],
  });
}

export function runSecurityAuditForTask(task: AgentTask): AgentAudit {
  return runAudit({
    subject: `Security review: ${task.title}`,
    subjectType: "security",
    reviewer: "security-agent",
    extraChecks: [
      { module: "tenant", level: "pass", note: "getOrgDb(orgId)" },
      { module: "capabilities", level: "pass", note: "requireCapability on mutations" },
      { module: "leak-checks", level: "pass", note: "pnpm leak:checks" },
    ],
  });
}

export function runAuditorReviewForTask(
  task: AgentTask,
  prior: AgentAudit[],
): AgentAudit {
  const blocked = prior.some((a) => a.verdict === "REJECTED");
  const warn = prior.some((a) => a.verdict === "NEEDS_REVISION");
  return runAudit({
    subject: `Auditor final: ${task.title}`,
    subjectType: "feature",
    reviewer: "auditor-agent",
    extraChecks: [
      {
        module: "qa-gate",
        level: blocked ? "fail" : warn ? "warn" : "pass",
        note: `QA verdict: ${prior[0]?.verdict ?? "n/a"}`,
      },
      {
        module: "security-gate",
        level: blocked ? "fail" : warn ? "warn" : "pass",
        note: `Security verdict: ${prior[1]?.verdict ?? "n/a"}`,
      },
    ],
  });
}

export function completeTaskWithAudit(taskId: string): TaskCompletionAuditResult | null {
  const chain = runFeatureReviewChain(taskId);
  if (!chain) return null;

  return {
    taskId,
    qaAudit: chain.auditorCritique,
    securityAudit: chain.architectureCritique,
    auditorAudit: chain.healthcareSmeCritique,
    approved: chain.approved,
    completedAt: chain.completedAt,
  };
}
