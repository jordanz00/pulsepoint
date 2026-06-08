/**
 * AgentOrchestrator — daily autonomous cycle.
 *
 * Pipeline (workflow-driven):
 *   Backlog refresh → Research → Architecture → Product → Developer → QA → Auditor
 */
import type { DailyCycleResult } from "@/quake-os/orchestrator/daily-cycle-types";
import { generateId, memoryWrite, syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";
import { seedKnowledgeGraph, getGraph } from "@/quake-os/knowledge-graph/store";
import { completeExecution, startExecution } from "@/quake-os/orchestrator/execution-tracker";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { runWorkflow, dailyCycleFromWorkflow } from "@/quake-os/core/workflow-engine";

export class AgentOrchestrator {
  /**
   * Run the full daily agent cycle via workflow engine. Returns final audit results.
   */
  runDailyCycle(): DailyCycleResult {
    syncLegacyBacklog();
    initAllKnowledgeDbs();
    if (getGraph().nodes.length === 0) seedKnowledgeGraph();

    const startedAt = new Date().toISOString();
    const execution = startExecution({
      workflowId: "daily-cycle",
      agentIds: [
        "research-agent",
        "architecture-agent",
        "product-agent",
        "developer-agent",
        "qa-agent",
        "auditor-agent",
      ],
    });

    const backlog = refreshBacklog(["legacy", "research", "recommendations"]);

    const wf = runWorkflow("daily-cycle", {
      runGates: process.env.QUAKE_OS_RUN_GATES === "1",
    });

    if (!wf) {
      completeExecution(execution.id, "failed", "daily-cycle workflow missing");
      throw new Error("daily-cycle workflow not found");
    }

    const pipeline = dailyCycleFromWorkflow(wf);

    const result: DailyCycleResult = {
      id: generateId("daily"),
      startedAt,
      completedAt: new Date().toISOString(),
      backlog,
      ...pipeline,
    };

    memoryWrite("lessons", result, {
      title: `Daily cycle ${result.id}`,
      tags: ["daily-cycle", result.audit.verdict.toLowerCase()],
    });

    completeExecution(execution.id, wf.failedStepId ? "failed" : "completed");

    return result;
  }
}

/** Functional entry — mirrors Python `AgentOrchestrator().run_daily_cycle()`. */
export function runDailyCycle(): DailyCycleResult {
  return new AgentOrchestrator().runDailyCycle();
}
