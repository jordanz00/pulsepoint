#!/usr/bin/env tsx
import { syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";
import { runWorkflow } from "@/quake-os/core/workflow-engine";

const workflowId = process.argv[2] ?? "daily-cycle";

syncLegacyBacklog();
initAllKnowledgeDbs();

const result = runWorkflow(workflowId, {
  runGates: process.env.QUAKE_OS_RUN_GATES === "1",
});

if (!result) {
  console.error(`Workflow not found: ${workflowId}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      id: result.id,
      workflowId: result.workflowId,
      steps: result.steps.length,
      failedStepId: result.failedStepId,
      agents: result.steps.map((s) => s.agentId),
    },
    null,
    2,
  ),
);
