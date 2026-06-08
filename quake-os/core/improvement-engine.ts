/**
 * Quake OS — continuous improvement after feature completion.
 */
import type { WorkflowDefinition } from "@/quake-os/core/types";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { runFeatureCompleteAudit } from "@/quake-os/core/audit-engine";
import { updateTaskStatus } from "@/quake-os/core/task-engine";
import fs from "node:fs";
import path from "node:path";
import { QUAKE_OS_ROOT } from "@/quake-os/core/paths";

export type ImprovementReview = {
  id: string;
  featureName: string;
  taskId?: string;
  workflowId: string;
  stepsCompleted: string[];
  auditId: string;
  passed: boolean;
  createdAt: string;
};

export function loadWorkflow(id: string): WorkflowDefinition | null {
  const filePath = path.join(QUAKE_OS_ROOT, "workflows", `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as WorkflowDefinition;
}

export function runImprovementLoop(input: {
  featureName: string;
  taskId?: string;
  workflowId?: string;
}): ImprovementReview {
  const workflowId = input.workflowId ?? "feature-complete";
  const workflow = loadWorkflow(workflowId);
  const stepsCompleted: string[] = [];

  if (workflow) {
    for (const step of workflow.steps) {
      sendMessage({
        from: "orchestrator",
        to: step.agentId,
        subject: `${workflow.name}: ${step.action}`,
        body: `Feature "${input.featureName}" requires ${step.action}.`,
        refs: input.taskId ? [input.taskId] : undefined,
      });
      stepsCompleted.push(step.id);
    }
  }

  const audit = runFeatureCompleteAudit(input.featureName);
  const passed = audit.verdict === "APPROVED";

  if (passed && input.taskId) {
    updateTaskStatus(input.taskId, "done");
  }

  const review: ImprovementReview = {
    id: generateId("impr"),
    featureName: input.featureName,
    taskId: input.taskId,
    workflowId,
    stepsCompleted,
    auditId: audit.id,
    passed,
    createdAt: new Date().toISOString(),
  };

  memoryWrite("lessons", review, {
    title: `Improvement: ${input.featureName}`,
    tags: [passed ? "passed" : "needs-work"],
  });

  return review;
}
