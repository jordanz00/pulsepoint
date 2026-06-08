/**
 * Quake OS — Build review chain (shorter path)
 * Developer → QA → Auditor
 */
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryRead, memoryWrite } from "@/quake-os/core/memory-store";
import { updateTaskStatus } from "@/quake-os/core/task-engine";
import { DeveloperAgent } from "@/quake-os/agents/services/developer-agent";
import { QAAgent } from "@/quake-os/agents/services/qa-agent";
import { AuditorAgent } from "@/quake-os/agents/services/auditor-agent";
import type { FeatureBuildResult } from "@/quake-os/core/feature-review-chain";

export type BuildReviewChainResult = {
  id: string;
  taskId: string;
  developer: FeatureBuildResult;
  qa: ReturnType<typeof QAAgent.testFeature>;
  auditorReview: AgentAudit;
  approved: boolean;
  completedAt: string;
};

export function runBuildReviewChain(taskId: string): BuildReviewChainResult | null {
  const task = memoryRead<AgentTask>("tasks", taskId);
  if (!task) return null;

  updateTaskStatus(taskId, "in_progress");

  const developer = DeveloperAgent.buildFeature(task);
  const qa = QAAgent.testFeature(developer);
  const auditorReview = AuditorAgent.critiqueFeature(task, qa);

  const approved = auditorReview.verdict === "APPROVED";

  updateTaskStatus(taskId, approved ? "done" : auditorReview.verdict === "REJECTED" ? "blocked" : "review");

  const result: BuildReviewChainResult = {
    id: generateId("brc"),
    taskId,
    developer,
    qa,
    auditorReview,
    approved,
    completedAt: new Date().toISOString(),
  };

  memoryWrite("audits", result, {
    title: `Build review: ${task.title}`,
    agentId: "auditor-agent",
    tags: ["build-review-chain", approved ? "approved" : "needs-revision"],
  });

  sendMessage({
    from: "auditor-agent",
    to: approved ? "ceo-agent" : "developer-agent",
    subject: approved ? `Audit approved: ${task.title}` : `Audit review: ${auditorReview.verdict}`,
    body: auditorReview.recommendations.join("\n"),
    refs: [taskId, auditorReview.id],
  });

  return result;
}
