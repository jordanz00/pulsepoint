#!/usr/bin/env tsx
/**
 * Quake OS — full automation pipeline CLI.
 *
 * Usage:
 *   pnpm quake:automation:run              # gates + backlog + wave + report
 *   pnpm quake:automation:run --skip-gates   # planning only
 *   QUAKE_OS_RUN_GATES=1 pnpm quake:automation:run
 */
import { runAutomationPipeline } from "@/quake-os/core/automation-pipeline";

const args = new Set(process.argv.slice(2));
const skipGates = args.has("--skip-gates");
const skipWorkflow = args.has("--skip-workflow");

const result = runAutomationPipeline({
  skipGates,
  runWorkflow: !skipWorkflow,
});

console.log(
  JSON.stringify(
    {
      id: result.id,
      name: result.name,
      verdict: result.verdict,
      gatesPassed: result.gates.passed,
      backlog: result.backlogItems.map((i) => ({
        id: i.id,
        priority: i.priority,
        human: Boolean(i.human),
        title: i.title,
      })),
      reportPath: result.reportPath,
      auditVerdict: result.auditVerdict,
      workflow: result.workflowId,
    },
    null,
    2,
  ),
);

if (!result.gates.passed) {
  console.error("\nQuake OS automation: STOP — gates failed. See report:", result.reportPath);
  process.exit(1);
}

if (result.verdict === "NEEDS_REVISION" || result.verdict === "STOP_GATES") {
  process.exit(1);
}
