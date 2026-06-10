/**
 * CorporationOrchestrator — full AI corporation cycle.
 *
 * Runs all divisions: parallel intelligence → engineering pipeline → C-suite synthesis → audit.
 * Framework coordinates agents; Cursor/human implements code from build plans.
 */
import type { AgentAudit, AgentId } from "@/quake-os/core/types";
import { CORPORATION_DIVISIONS } from "@/quake-os/core/corporation";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { pickTopTasks } from "@/quake-os/core/task-engine";
import { executeServiceAction } from "@/quake-os/agents/services/service-registry";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { recordDecision } from "@/quake-os/core/planning-engine";
import { sendMessage } from "@/quake-os/core/communication";
import { runAudit } from "@/quake-os/core/audit-engine";
import { bootstrapOs } from "@/quake-os/orchestrator/index";
import { completeExecution, startExecution } from "@/quake-os/orchestrator/execution-tracker";
import type {
  ArchitectureReviewResult,
  DeveloperBuildResult,
  ProductTasksResult,
  QATestResult,
  ResearchCycleResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/quake-os/core/paths";

export type DivisionRunResult = {
  divisionId: string;
  divisionName: string;
  leadAgent: AgentId;
  steps: { agentId: AgentId; action: string; ok: boolean }[];
};

export type CorporationCycleResult = {
  id: string;
  startedAt: string;
  completedAt: string;
  divisions: DivisionRunResult[];
  research: ResearchCycleResult;
  architecture: ArchitectureReviewResult;
  product: ProductTasksResult;
  developer: DeveloperBuildResult;
  qa: QATestResult;
  audit: AgentAudit;
  executive: {
    ceoDirective: string;
    ctoHealth: Record<string, unknown>;
    boardVerdict: "SHIP" | "REVISE" | "STOP";
    rationale: string;
  };
  agentsActivated: AgentId[];
  backlogRefreshed: number;
};

function runDivisionStep(
  agentId: AgentId,
  action: string,
  ctx: Record<string, unknown>,
): AgentServiceResult {
  return executeServiceAction(agentId, action, ctx);
}

function runParallelDivisions(ctx: Record<string, unknown>): DivisionRunResult[] {
  const topTask = pickTopTasks(1)[0];
  if (topTask) ctx.task = topTask;

  const parallelSpecs: { divisionId: string; steps: { agentId: AgentId; action: string }[] }[] = [
    {
      divisionId: "research",
      steps: [{ agentId: "research-agent", action: "ResearchAgent.run()" }],
    },
    {
      divisionId: "compliance",
      steps: [{ agentId: "compliance-agent", action: "ComplianceAgent.audit()" }],
    },
    {
      divisionId: "industry",
      steps: [
        { agentId: "healthcare-sme-agent", action: "HealthcareSmeAgent.review()" },
        { agentId: "hospital-association-agent", action: "HospitalAssociationAgent.review()" },
      ],
    },
    {
      divisionId: "executive",
      steps: [{ agentId: "cto-agent", action: "CtoAgent.healthCheck()" }],
    },
  ];

  return parallelSpecs.map((spec) => {
    const division = CORPORATION_DIVISIONS.find((d) => d.id === spec.divisionId)!;
    const steps = spec.steps.map((s) => {
      const result = runDivisionStep(s.agentId, s.action, ctx);
      if (s.agentId === "research-agent" && result.ok) {
        ctx.research = result.data;
      }
      return { agentId: s.agentId, action: s.action, ok: result.ok };
    });
    return {
      divisionId: spec.divisionId,
      divisionName: division.name,
      leadAgent: division.leadAgentId,
      steps,
    };
  });
}

function synthesizeExecutive(input: {
  audit: AgentAudit;
  product: ProductTasksResult;
  qa: QATestResult;
  ctx: Record<string, unknown>;
}): CorporationCycleResult["executive"] {
  const ceoResult = runDivisionStep("ceo-agent", "Executive verdict", input.ctx);
  const ctoResult = runDivisionStep("cto-agent", "CtoAgent.healthCheck()", input.ctx);

  const ceoData = ceoResult.data as { directive?: string; taskIds?: string[] } | undefined;
  const ctoHealth = (ctoResult.data ?? {}) as Record<string, unknown>;

  let boardVerdict: CorporationCycleResult["executive"]["boardVerdict"] = "SHIP";
  if (input.audit.verdict === "REJECTED") boardVerdict = "STOP";
  else if (input.audit.verdict === "NEEDS_REVISION") boardVerdict = "REVISE";
  else if (!input.qa.checklist.every((c) => c.status === "pass")) boardVerdict = "REVISE";

  const rationale =
    boardVerdict === "SHIP"
      ? `Board approves ${input.product.taskIds.length} tasks for Cursor implementation.`
      : boardVerdict === "REVISE"
        ? `Board requests revision — audit: ${input.audit.verdict}, QA checklist has warnings.`
        : `Board stops ship — audit rejected.`;

  recordDecision({
    title: `Corporation board ${boardVerdict}`,
    context: JSON.stringify({
      audit: input.audit.verdict,
      tasks: input.product.taskIds,
      qaItems: input.qa.checklist.length,
    }),
    decision: rationale,
    alternatives: ["Defer to next cycle", "Demo-only ship", "Human escalation"],
    decidedBy: "ceo-agent",
  });

  sendMessage({
    from: "ceo-agent",
    to: boardVerdict === "SHIP" ? "developer-agent" : "product-agent",
    subject: `Board ${boardVerdict}: corporation cycle`,
    body: rationale,
    refs: input.product.taskIds,
  });

  return {
    ceoDirective: ceoData?.directive ?? "Prioritize top backlog",
    ctoHealth,
    boardVerdict,
    rationale,
  };
}

function fileCorporationReport(result: CorporationCycleResult): string {
  const wavesDir = path.join(REPO_ROOT, "data", "quake-os", "waves");
  if (!fs.existsSync(wavesDir)) fs.mkdirSync(wavesDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const mdPath = path.join(wavesDir, `${date}-corporation-cycle.md`);

  const body = `# Quake OS Corporation Cycle

**ID:** ${result.id}  
**Completed:** ${result.completedAt}  
**Board verdict:** ${result.executive.boardVerdict}

## Divisions activated

| Division | Lead | Steps |
|----------|------|-------|
${result.divisions
  .map(
    (d) =>
      `| ${d.divisionName} | ${d.leadAgent} | ${d.steps.map((s) => `${s.agentId} (${s.ok ? "✅" : "❌"})`).join(", ")} |`,
  )
  .join("\n")}

## Engineering pipeline

| Stage | Agent | Output |
|-------|-------|--------|
| Research | research-agent | ${result.research.research.length} findings |
| Architecture | architecture-agent | ${result.architecture.findings.length} findings |
| Product | product-agent | ${result.product.taskIds.join(", ")} |
| Developer | developer-agent | ${result.developer.buildPlans.length} build plans |
| QA | qa-agent | ${result.qa.checklist.length} checklist items |
| Audit | auditor-agent | ${result.audit.verdict} |

## Executive synthesis

- **CEO directive:** ${result.executive.ceoDirective}
- **Board verdict:** ${result.executive.boardVerdict}
- **Rationale:** ${result.executive.rationale}

## Cursor handoff

\`\`\`
@quake-os-orchestrator Run corporation implementation for: ${result.product.tasks[0]?.title ?? "top backlog item"}.
Tasks: ${result.product.taskIds.join(", ")}
Board: ${result.executive.boardVerdict}
Ground truth: docs/PRODUCT-CLAIMS.md, getOrgDb, pnpm quake:gates before PR.
\`\`\`

## Agents activated (${result.agentsActivated.length})

${result.agentsActivated.join(", ")}
`;

  fs.writeFileSync(mdPath, body);
  return mdPath;
}

export class CorporationOrchestrator {
  runCorporationCycle(input?: { runGates?: boolean }): CorporationCycleResult {
    bootstrapOs();

    const startedAt = new Date().toISOString();
    const execution = startExecution({
      workflowId: "corporation-cycle",
      agentIds: [
        "research-agent",
        "architecture-agent",
        "product-agent",
        "developer-agent",
        "qa-agent",
        "auditor-agent",
        "ceo-agent",
        "cto-agent",
        "compliance-agent",
        "healthcare-sme-agent",
        "hospital-association-agent",
        "documentation-agent",
      ],
    });

    const ctx: Record<string, unknown> = {
      runGates: input?.runGates === true || process.env.QUAKE_OS_RUN_GATES === "1",
    };

    const backlogResult = refreshBacklog(["legacy", "ams", "research", "audits", "recommendations"]);

    const divisions = runParallelDivisions(ctx);

    const archResult = runDivisionStep("architecture-agent", "ArchitectureAgent.review()", ctx);
    ctx.architecture = archResult.data;
    const architecture = archResult.data as ArchitectureReviewResult;

    const productResult = runDivisionStep("product-agent", "ProductAgent.generateTasks()", ctx);
    ctx.product = productResult.data;
    const product = productResult.data as ProductTasksResult;

    const devResult = runDivisionStep("developer-agent", "DeveloperAgent.build()", ctx);
    ctx.developer = devResult.data;
    const developer = devResult.data as DeveloperBuildResult;

    const qaResult = runDivisionStep("qa-agent", "QAAgent.test()", ctx);
    ctx.qa = qaResult.data;
    const qa = qaResult.data as QATestResult;

    const auditResult = runDivisionStep("auditor-agent", "AuditorAgent.audit()", ctx);
    const audit = (auditResult.data as AgentAudit) ?? runAudit({
      subject: "Corporation cycle",
      subjectType: "architecture",
      reviewer: "auditor-agent",
    });

    runDivisionStep("documentation-agent", "DocumentationAgent.sync()", ctx);

    const executive = synthesizeExecutive({ audit, product, qa, ctx });

    const agentsActivated = new Set<AgentId>();
    for (const div of divisions) {
      for (const step of div.steps) agentsActivated.add(step.agentId);
    }
    [
      "architecture-agent",
      "product-agent",
      "developer-agent",
      "qa-agent",
      "auditor-agent",
      "ceo-agent",
      "documentation-agent",
    ].forEach((a) => agentsActivated.add(a as AgentId));

    const result: CorporationCycleResult = {
      id: generateId("corp"),
      startedAt,
      completedAt: new Date().toISOString(),
      divisions,
      research: (ctx.research as ResearchCycleResult) ?? {
        agentId: "research-agent",
        research: [],
        tasksCreated: 0,
        recommendations: [],
        completedAt: new Date().toISOString(),
      },
      architecture,
      product,
      developer,
      qa,
      audit,
      executive,
      agentsActivated: [...agentsActivated],
      backlogRefreshed: backlogResult.tasksCreated.length,
    };

    const reportPath = fileCorporationReport(result);
    memoryWrite("lessons", { ...result, reportPath }, {
      title: `Corporation cycle ${result.id}`,
      tags: ["corporation-cycle", result.executive.boardVerdict.toLowerCase()],
    });

    completeExecution(execution.id, executive.boardVerdict === "STOP" ? "failed" : "completed");

    return result;
  }
}

export function runCorporationCycle(input?: { runGates?: boolean }): CorporationCycleResult {
  return new CorporationOrchestrator().runCorporationCycle(input);
}
