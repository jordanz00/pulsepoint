/**
 * Quake OS Feature Review Chain
 *
 * Developer → QA → Auditor → Architecture → Healthcare SME → CEO
 */
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryWrite, memoryRead } from "@/quake-os/core/memory-store";
import { updateTaskStatus } from "@/quake-os/core/task-engine";
import { DeveloperAgent } from "@/quake-os/agents/services/developer-agent";
import { QAAgent } from "@/quake-os/agents/services/qa-agent";
import { AuditorAgent } from "@/quake-os/agents/services/auditor-agent";
import { ArchitectureAgent } from "@/quake-os/agents/services/architecture-agent";
import { HealthcareSmeAgent } from "@/quake-os/agents/services/healthcare-sme-agent";
import { CeoAgent } from "@/quake-os/agents/services/ceo-agent";

export type FeatureBuildResult = {
  agentId: "developer-agent";
  taskId: string;
  title: string;
  buildPlan: { taskId: string; summary: string; ownerAgent: string };
  status: "dispatched";
  completedAt: string;
};

export type CeoApprovalResult = {
  agentId: "ceo-agent";
  taskId: string;
  approved: boolean;
  verdict: "SHIP" | "REVISE" | "REJECT";
  rationale: string;
  priorVerdicts: Record<string, string>;
  completedAt: string;
};

export type FeatureReviewChainResult = {
  id: string;
  taskId: string;
  developer: FeatureBuildResult;
  qa: ReturnType<typeof QAAgent.testFeature>;
  auditorCritique: AgentAudit;
  architectureCritique: AgentAudit;
  healthcareSmeCritique: AgentAudit;
  ceoApproval: CeoApprovalResult;
  approved: boolean;
  completedAt: string;
};

function verdictFromAudit(audit: AgentAudit): string {
  return audit.verdict;
}

export function runFeatureReviewChain(taskId: string): FeatureReviewChainResult | null {
  const task = memoryRead<AgentTask>("tasks", taskId);
  if (!task) return null;

  updateTaskStatus(taskId, "in_progress");

  // 1. Developer Agent builds feature
  const developer = DeveloperAgent.buildFeature(task);

  // 2. QA Agent tests
  const qa = QAAgent.testFeature(developer);

  // 3. Auditor Agent critiques
  const auditorCritique = AuditorAgent.critiqueFeature(task, qa);

  // 4. Architecture Agent critiques
  const architectureCritique = ArchitectureAgent.critiqueFeature(task, [
    auditorCritique,
  ]);

  // 5. Healthcare SME critiques
  const healthcareSmeCritique = HealthcareSmeAgent.critiqueFeature(task, [
    auditorCritique,
    architectureCritique,
  ]);

  // 6. CEO Agent approves
  const ceoApproval = CeoAgent.approveFeature(task, {
    auditor: auditorCritique,
    architecture: architectureCritique,
    healthcareSme: healthcareSmeCritique,
  });

  const approved = ceoApproval.approved;

  if (approved) {
    updateTaskStatus(taskId, "done");
  } else if (ceoApproval.verdict === "REJECT") {
    updateTaskStatus(taskId, "blocked");
  } else {
    updateTaskStatus(taskId, "review");
  }

  const result: FeatureReviewChainResult = {
    id: generateId("frc"),
    taskId,
    developer,
    qa,
    auditorCritique,
    architectureCritique,
    healthcareSmeCritique,
    ceoApproval,
    approved,
    completedAt: new Date().toISOString(),
  };

  memoryWrite("audits", result, {
    title: `Feature review: ${task.title}`,
    agentId: "ceo-agent",
    tags: ["feature-review-chain", approved ? "approved" : ceoApproval.verdict.toLowerCase()],
  });

  memoryWrite("lessons", result, {
    title: `Review chain: ${task.title}`,
    tags: ["feature-review-chain"],
  });

  sendMessage({
    from: "ceo-agent",
    to: approved ? "documentation-agent" : task.ownerAgent,
    subject: approved
      ? `CEO approved: ${task.title}`
      : `CEO ${ceoApproval.verdict}: ${task.title}`,
    body: ceoApproval.rationale,
    refs: [taskId, result.id],
  });

  return result;
}

export function summarizeReviewChain(result: FeatureReviewChainResult): string {
  return [
    `Developer: ${result.developer.status}`,
    `QA: ${result.qa.checklist.filter((c) => c.status === "pass").length}/${result.qa.checklist.length} checks`,
    `Auditor: ${verdictFromAudit(result.auditorCritique)}`,
    `Architecture: ${verdictFromAudit(result.architectureCritique)}`,
    `Healthcare SME: ${verdictFromAudit(result.healthcareSmeCritique)}`,
    `CEO: ${result.ceoApproval.verdict}`,
  ].join(" | ");
}
