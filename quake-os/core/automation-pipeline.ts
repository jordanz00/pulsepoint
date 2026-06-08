/**
 * Quake OS — end-to-end automation pipeline (gates → backlog → wave → report).
 *
 * Single entry for local CLI, GitHub Actions, and Cursor session handoff.
 */
import fs from "node:fs";
import path from "node:path";
import type { WaveReport } from "@/quake-os/core/types";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import type { GateSuiteResult } from "@/quake-os/core/gate-runner";
import { runGateSuite } from "@/quake-os/core/gate-runner";
import { runAudit } from "@/quake-os/core/audit-engine";
import { REPO_ROOT } from "@/quake-os/core/paths";
import { bootstrapOs, runWave } from "@/quake-os/orchestrator/index";
import { runWorkflow } from "@/quake-os/core/workflow-engine";

export type LegacyBacklogItem = {
  id: string;
  title: string;
  division: string;
  priority: "P0" | "P1" | "P2" | "P3" | string;
  status: string;
  agents?: string[];
  human?: boolean;
  notes?: string;
};

export type AutomationRunResult = {
  id: string;
  name: string;
  gates: GateSuiteResult;
  backlogItems: LegacyBacklogItem[];
  humanOnlyItems: LegacyBacklogItem[];
  codeItems: LegacyBacklogItem[];
  wave: WaveReport;
  workflowId: string | null;
  workflowSteps: number;
  reportPath: string;
  auditVerdict: string;
  verdict: "SHIP" | "STOP_GATES" | "HUMAN_REQUIRED" | "NEEDS_REVISION";
  completedAt: string;
};

const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

function priorityRank(p: string): number {
  return PRIORITY_ORDER[p] ?? 9;
}

export function loadLegacyBacklog(): {
  _meta: Record<string, unknown>;
  items: LegacyBacklogItem[];
} {
  const backlogPath = path.join(REPO_ROOT, "data", "quake-os", "improvement-backlog.json");
  return JSON.parse(fs.readFileSync(backlogPath, "utf8")) as {
    _meta: Record<string, unknown>;
    items: LegacyBacklogItem[];
  };
}

export function pickLegacyBacklogItems(count = 3): LegacyBacklogItem[] {
  const { items } = loadLegacyBacklog();
  return items
    .filter((i) => i.status === "pending" || i.status === "in_progress")
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, count);
}

function updateBacklogMeta(openTasks: number): void {
  const backlogPath = path.join(REPO_ROOT, "data", "quake-os", "improvement-backlog.json");
  const data = loadLegacyBacklog();
  if (!data._meta) data._meta = {};
  data._meta.lastBacklogRefresh = new Date().toISOString();
  data._meta.openTasks = openTasks;
  fs.writeFileSync(backlogPath, `${JSON.stringify(data, null, 2)}\n`);
}

function buildAuditDigest(input: {
  gates: GateSuiteResult;
  backlogItems: LegacyBacklogItem[];
  humanOnlyItems: LegacyBacklogItem[];
  auditVerdict: string;
}): string {
  const lines: string[] = [];
  lines.push(input.gates.passed ? "✔ gates: pnpm quake:gates passed" : "❌ gates: FAILED — fix before ship");
  lines.push(`✔ backlog: picked ${input.backlogItems.length} items (${input.backlogItems.map((i) => i.id).join(", ")})`);
  if (input.humanOnlyItems.length > 0) {
    lines.push(
      `⚠ human: ${input.humanOnlyItems.map((i) => i.id).join(", ")} require operator — automation skips implementation`,
    );
  }
  lines.push(`VERDICT: ${input.auditVerdict}`);
  lines.push("Sources: data/quake-os/improvement-backlog.json, scripts/quake-gates.sh");
  return lines.join("\n");
}

export function writeAutomationWaveReport(input: {
  name: string;
  gates: GateSuiteResult;
  backlogItems: LegacyBacklogItem[];
  humanOnlyItems: LegacyBacklogItem[];
  codeItems: LegacyBacklogItem[];
  wave: WaveReport;
  workflowId: string | null;
  workflowSteps: number;
  auditVerdict: string;
  verdict: AutomationRunResult["verdict"];
}): string {
  const wavesDir = path.join(REPO_ROOT, "data", "quake-os", "waves");
  if (!fs.existsSync(wavesDir)) fs.mkdirSync(wavesDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const slug = input.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const mdPath = path.join(wavesDir, `${date}-${slug}.md`);

  const digest = buildAuditDigest({
    gates: input.gates,
    backlogItems: input.backlogItems,
    humanOnlyItems: input.humanOnlyItems,
    auditVerdict: input.auditVerdict,
  });

  const body = `# Quake OS automation run — ${input.name}

**Completed:** ${new Date().toISOString()}  
**Verdict:** ${input.verdict}  
**Wave ID:** ${input.wave.id}

## Gates

| Check | Result |
|-------|--------|
| Command | \`${input.gates.command}\` |
| Passed | ${input.gates.passed ? "✅" : "❌"} |

## Backlog (top picks)

| ID | Priority | Division | Human | Title |
|----|----------|----------|-------|-------|
${input.backlogItems
  .map(
    (i) =>
      `| ${i.id} | ${i.priority} | ${i.division} | ${i.human ? "yes" : "no"} | ${i.title.replace(/\|/g, "/")} |`,
  )
  .join("\n")}

## Code-ready items

${input.codeItems.length ? input.codeItems.map((i) => `- **${i.id}** — ${i.title} (${i.agents?.join(", ") ?? "unassigned"})`).join("\n") : "_None — all picks are human-only or gates failed._"}

## Human-only items

${input.humanOnlyItems.length ? input.humanOnlyItems.map((i) => `- **${i.id}** — ${i.title}`).join("\n") : "_None._"}

## Wave

- **Tasks picked:** ${input.wave.tasksPicked.join(", ")}
- **Agents:** ${input.wave.agentsActivated.join(", ")}
- **Workflow:** ${input.workflowId ?? "skipped"} (${input.workflowSteps} steps)

## Audit digest

\`\`\`
${digest}
\`\`\`

## Cursor handoff

For implementation on code items, run in Cursor:

\`\`\`
@quake-os-orchestrator Run Phase 3–4 for: ${input.codeItems[0]?.title ?? "next backlog item"}.
Items: ${input.codeItems.map((i) => i.id).join(", ") || "none"}
Ground truth: docs/PRODUCT-CLAIMS.md, getOrgDb, pnpm quake:gates before PR.
\`\`\`
`;

  fs.writeFileSync(mdPath, body);
  return mdPath;
}

export function runAutomationPipeline(input?: {
  name?: string;
  taskCount?: number;
  skipGates?: boolean;
  runWorkflow?: boolean;
}): AutomationRunResult {
  const name = input?.name ?? `automation-${new Date().toISOString().slice(0, 10)}`;
  const taskCount = input?.taskCount ?? 3;

  bootstrapOs();

  let gates: GateSuiteResult;
  if (input?.skipGates) {
    gates = {
      command: "skipped",
      checks: [{ command: "skipped", status: "skipped", durationMs: 0 }],
      passed: true,
      completedAt: new Date().toISOString(),
    };
  } else {
    process.env.QUAKE_OS_RUN_GATES = "1";
    gates = runGateSuite();
  }

  refreshBacklog(["legacy", "ams", "audits", "recommendations"]);

  const backlogItems = pickLegacyBacklogItems(taskCount);
  const humanOnlyItems = backlogItems.filter((i) => i.human);
  const codeItems = backlogItems.filter((i) => !i.human);

  const openTasks = loadLegacyBacklog().items.filter(
    (i) => i.status === "pending" || i.status === "in_progress",
  ).length;
  updateBacklogMeta(openTasks);

  const wave = runWave({
    name,
    taskCount,
    runResearch: true,
    runGates: !input?.skipGates,
    gatesResult: gates,
  });

  let workflowId: string | null = null;
  let workflowSteps = 0;
  if (input?.runWorkflow !== false && gates.passed) {
    const wf = runWorkflow("continuous-improvement", { runGates: true });
    if (wf) {
      workflowId = wf.workflowId;
      workflowSteps = wf.steps.length;
    }
  }

  const audit = runAudit({
    subject: `Automation: ${name}`,
    subjectType: "architecture",
    reviewer: "auditor-agent",
  });

  let verdict: AutomationRunResult["verdict"];
  if (!gates.passed) verdict = "STOP_GATES";
  else if (codeItems.length === 0 && humanOnlyItems.length > 0) verdict = "HUMAN_REQUIRED";
  else if (audit.verdict === "REJECTED") verdict = "NEEDS_REVISION";
  else if (audit.verdict === "APPROVED" || audit.verdict === "NEEDS_REVISION") verdict = "SHIP";
  else verdict = "NEEDS_REVISION";

  const reportPath = writeAutomationWaveReport({
    name,
    gates,
    backlogItems,
    humanOnlyItems,
    codeItems,
    wave,
    workflowId,
    workflowSteps,
    auditVerdict: audit.verdict,
    verdict,
  });

  return {
    id: wave.id,
    name,
    gates,
    backlogItems,
    humanOnlyItems,
    codeItems,
    wave,
    workflowId,
    workflowSteps,
    reportPath,
    auditVerdict: audit.verdict,
    verdict,
    completedAt: new Date().toISOString(),
  };
}
