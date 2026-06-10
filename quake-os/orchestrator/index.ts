/**
 * Quake OS — master orchestrator.
 */
import type { AgentId, WaveReport } from "@/quake-os/core/types";
import { getAgentIds, loadAgentRegistry } from "@/quake-os/core/agent-registry";
import { getAuditPassRate, runAudit } from "@/quake-os/core/audit-engine";
import { getMemorySummary, syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { runImprovementLoop } from "@/quake-os/core/improvement-engine";
import { createSprintPlan, recordDecision } from "@/quake-os/core/planning-engine";
import { runResearchCycle } from "@/quake-os/core/research-engine";
import { listTasks, pickTopTasks } from "@/quake-os/core/task-engine";
import { getGraph, seedKnowledgeGraph } from "@/quake-os/knowledge-graph/store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";
import { getKnowledgeStatus } from "@/quake-os/knowledge/store";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import type { GateSuiteResult } from "@/quake-os/core/gate-runner";
import { runGateSuite } from "@/quake-os/core/gate-runner";
import fs from "node:fs";
import path from "node:path";
import { QUAKE_OS_ROOT, REPO_ROOT } from "@/quake-os/core/paths";

export type OsStatus = {
  version: string;
  agents: number;
  memory: ReturnType<typeof getMemorySummary>;
  tasks: { pending: number; inProgress: number; done: number };
  audits: ReturnType<typeof getAuditPassRate>;
  knowledgeGraph: { nodes: number; edges: number };
  knowledgeDbs: ReturnType<typeof getKnowledgeStatus>;
};

export function getOsStatus(): OsStatus {
  const tasks = listTasks();
  const graph = getGraph();
  return {
    version: "1.0.0",
    agents: loadAgentRegistry().length,
    memory: getMemorySummary(),
    tasks: {
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    },
    audits: getAuditPassRate(),
    knowledgeGraph: { nodes: graph.nodes.length, edges: graph.edges.length },
    knowledgeDbs: getKnowledgeStatus(),
  };
}

export function bootstrapOs(): {
  syncedTasks: number;
  graph: ReturnType<typeof getGraph>;
  status: OsStatus;
} {
  const syncedTasks = syncLegacyBacklog();
  initAllKnowledgeDbs();
  const graph = getGraph();
  if (graph.nodes.length === 0) seedKnowledgeGraph();

  recordDecision({
    title: "Quake OS bootstrap",
    context: "Master build directive — OS before features",
    decision: "File-backed memory + engines + orchestrator operational",
    alternatives: ["External agent runtime", "Database-backed memory"],
    decidedBy: "ceo-agent",
  });

  return { syncedTasks, graph: getGraph(), status: getOsStatus() };
}

export function runWave(input?: {
  name?: string;
  taskCount?: number;
  runResearch?: boolean;
  runGates?: boolean;
  gatesResult?: GateSuiteResult;
}): WaveReport {
  bootstrapOs();

  let gatesPassed = true;
  let gateNote = "Run pnpm quake:gates for hard verification";
  if (input?.gatesResult) {
    gatesPassed = input.gatesResult.passed;
    gateNote = input.gatesResult.passed
      ? "pnpm quake:gates passed"
      : `pnpm quake:gates FAILED: ${input.gatesResult.checks[0]?.output?.slice(0, 120) ?? "see logs"}`;
  } else if (input?.runGates) {
    process.env.QUAKE_OS_RUN_GATES = "1";
    const gates = runGateSuite();
    gatesPassed = gates.passed;
    gateNote = gates.passed ? "pnpm quake:gates passed" : "pnpm quake:gates FAILED";
  }

  const name = input?.name ?? `continuous-${new Date().toISOString().slice(0, 10)}`;
  const tasks = pickTopTasks(input?.taskCount ?? 3);
  const agentsActivated = new Set<AgentId>(tasks.map((t) => t.ownerAgent));

  if (input?.runResearch !== false) {
    const research = runResearchCycle();
    agentsActivated.add("research-agent");
    for (const r of research.research) agentsActivated.add(r.authorAgent);
  }

  const phase2Agents: AgentId[] = [
    "ceo-agent",
    "cto-agent",
    "product-agent",
    "compliance-agent",
    "auditor-agent",
  ];
  for (const a of phase2Agents) agentsActivated.add(a);

  createSprintPlan({
    name,
    phase: 2,
    initiative: "Quake OS continuous wave",
    taskCount: input?.taskCount ?? 3,
    agents: [...agentsActivated],
    acceptanceCriteria: [
      "pnpm quake:gates passes",
      "Audit verdict APPROVED or NEEDS_REVISION documented",
      "Wave report filed",
    ],
  });

  const audit = runAudit({
    subject: `Wave: ${name}`,
    subjectType: "architecture",
    reviewer: "auditor-agent",
  });

  const report: WaveReport = {
    id: generateId("wave"),
    name,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    tasksPicked: tasks.map((t) => t.id),
    agentsActivated: [...agentsActivated],
    gatesPassed,
    auditVerdict: audit.verdict,
    notes: [
      `Picked ${tasks.length} tasks`,
      `Activated ${agentsActivated.size} agents`,
      gateNote,
    ],
  };

  fileWaveReport(report);
  return report;
}

export function fileWaveReport(report: WaveReport): void {
  const wavesDir = path.join(REPO_ROOT, "data", "quake-os", "waves");
  if (!fs.existsSync(wavesDir)) fs.mkdirSync(wavesDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const slug = report.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const mdPath = path.join(wavesDir, `${date}-${slug}.md`);
  const body = `# Quake OS Wave — ${report.name}

**ID:** ${report.id}  
**Tasks:** ${report.tasksPicked.join(", ")}  
**Agents:** ${report.agentsActivated.join(", ")}  
**Audit:** ${report.auditVerdict ?? "pending"}  
**Gates:** ${report.gatesPassed ? "✅" : "❌"}

${report.notes.map((n) => `- ${n}`).join("\n")}
`;
  fs.writeFileSync(mdPath, body);
  memoryWrite("lessons", { ...report, id: report.id }, { title: report.name, tags: ["wave"] });
}

export function completeFeature(featureName: string, taskId?: string) {
  return runImprovementLoop({ featureName, taskId });
}

export { getAgentIds, loadAgentRegistry };
export { AgentOrchestrator, runDailyCycle } from "@/quake-os/orchestrator/agent-orchestrator";
export {
  CorporationOrchestrator,
  runCorporationCycle,
} from "@/quake-os/orchestrator/corporation-orchestrator";
export { getCorporationSummary, CORPORATION_DIVISIONS } from "@/quake-os/core/corporation";
export {
  schedule,
  runDueJobs,
  runDueWorkflows,
  listScheduledJobs,
} from "@/quake-os/orchestrator/scheduler";
export { refreshBacklog } from "@/quake-os/core/backlog-engine";
export { runWorkflow, dailyCycleFromWorkflow, listRunnableWorkflows } from "@/quake-os/core/workflow-engine";
export { runGateSuite, shouldRunGates } from "@/quake-os/core/gate-runner";
export {
  runFeatureReviewChain,
  summarizeReviewChain,
} from "@/quake-os/core/feature-review-chain";
export { runDiscoveryPipeline } from "@/quake-os/core/discovery-pipeline";
export { runBuildReviewChain } from "@/quake-os/core/build-review-chain";
export type { DailyCycleResult } from "@/quake-os/orchestrator/daily-cycle-types";
