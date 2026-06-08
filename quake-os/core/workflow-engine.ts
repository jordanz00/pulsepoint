/**
 * Quake OS — workflow step executor.
 *
 * Runs workflow JSON definitions by dispatching each step to agent services.
 */
import type { WorkflowDefinition } from "@/quake-os/core/types";
import { loadWorkflow } from "@/quake-os/core/improvement-engine";
import { executeServiceAction } from "@/quake-os/agents/services/service-registry";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { runGateSuite } from "@/quake-os/core/gate-runner";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { sendMessage } from "@/quake-os/core/communication";
import type {
  ArchitectureReviewResult,
  DeveloperBuildResult,
  ProductTasksResult,
  QATestResult,
  ResearchCycleResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentAudit } from "@/quake-os/core/types";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";

export type WorkflowStepResult = {
  stepId: string;
  agentId: string;
  action: string;
  ok: boolean;
  result: AgentServiceResult;
};

export type WorkflowRunResult = {
  id: string;
  workflowId: string;
  workflowName: string;
  steps: WorkflowStepResult[];
  failedStepId?: string;
  context: Record<string, unknown>;
  completedAt: string;
};

function updateContext(
  ctx: Record<string, unknown>,
  agentId: string,
  action: string,
  data: unknown,
): void {
  if (agentId === "research-agent" || action.includes("Research")) {
    ctx.research = data;
  }
  if (agentId === "architecture-agent") ctx.architecture = data;
  if (agentId === "product-agent") ctx.product = data;
  if (agentId === "developer-agent" || agentId === "backend-engineer-agent") {
    ctx.developer = data;
  }
  if (agentId === "qa-agent") ctx.qa = data;
  if (agentId === "auditor-agent") ctx.audit = data;
}

function runOrchestratorStep(action: string, ctx: Record<string, unknown>): AgentServiceResult {
  const now = new Date().toISOString();
  if (action.toLowerCase().includes("backlog")) {
    return {
      agentId: "orchestrator",
      action,
      ok: true,
      data: refreshBacklog(),
      completedAt: now,
    };
  }
  if (action.toLowerCase().includes("gates")) {
    const gates = runGateSuite({ dryRun: !ctx.runGates });
    return {
      agentId: "orchestrator",
      action,
      ok: gates.passed,
      data: gates,
      completedAt: now,
    };
  }
  return {
    agentId: "orchestrator",
    action,
    ok: true,
    data: { note: "Orchestrator step acknowledged" },
    completedAt: now,
  };
}

export function runWorkflow(
  workflowId: string,
  initialContext: Record<string, unknown> = {},
): WorkflowRunResult | null {
  const workflow = loadWorkflow(workflowId);
  if (!workflow) return null;

  const ctx: Record<string, unknown> = { ...initialContext };
  const steps: WorkflowStepResult[] = [];
  let failedStepId: string | undefined;

  for (const step of workflow.steps) {
    let result: AgentServiceResult;

    if (step.agentId === "orchestrator") {
      result = runOrchestratorStep(step.action, ctx);
    } else {
      result = executeServiceAction(step.agentId, step.action, ctx, {
        workflowId,
        stepId: step.id,
      });
    }

    const stepResult: WorkflowStepResult = {
      stepId: step.id,
      agentId: step.agentId,
      action: step.action,
      ok: result.ok,
      result,
    };
    steps.push(stepResult);

    if (result.ok) {
      updateContext(ctx, step.agentId, step.action, result.data);
    }

    sendMessage({
      from: "orchestrator",
      to: step.agentId,
      subject: `${workflow.name}: ${step.action}`,
      body: result.ok ? "Step completed." : "Step failed.",
      refs: [step.id],
    });

    if (step.required && !result.ok) {
      failedStepId = step.id;
      break;
    }
  }

  const run: WorkflowRunResult = {
    id: generateId("wf"),
    workflowId,
    workflowName: workflow.name,
    steps,
    failedStepId,
    context: ctx,
    completedAt: new Date().toISOString(),
  };

  memoryWrite("lessons", run, {
    title: `Workflow: ${workflow.name}`,
    tags: ["workflow", workflowId, failedStepId ? "failed" : "completed"],
  });

  return run;
}

/** Map daily-cycle workflow context to typed pipeline result. */
export function dailyCycleFromWorkflow(run: WorkflowRunResult) {
  return {
    research: run.context.research as ResearchCycleResult,
    architecture: run.context.architecture as ArchitectureReviewResult,
    product: run.context.product as ProductTasksResult,
    developer: run.context.developer as DeveloperBuildResult,
    qa: run.context.qa as QATestResult,
    audit: run.context.audit as AgentAudit,
  };
}

export function listRunnableWorkflows(): WorkflowDefinition[] {
  const ids = [
    "daily-cycle",
    "daily-research",
    "continuous-improvement",
    "discovery-to-ship",
    "feature-review-chain",
    "feature-complete",
  ];
  return ids.map((id) => loadWorkflow(id)).filter((w): w is WorkflowDefinition => Boolean(w));
}
