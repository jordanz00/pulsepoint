#!/usr/bin/env tsx
/**
 * Quake OS CLI — bootstrap, status, wave, research, scheduler.
 */
import { bootstrapOs, getOsStatus, runDailyCycle, runWave } from "@/quake-os/orchestrator/index";
import { runDueWorkflows, listScheduledJobs } from "@/quake-os/orchestrator/scheduler";
import { runResearchCycle } from "@/quake-os/core/research-engine";

const cmd = process.argv[2] ?? "status";

function printStatus(): void {
  const { status } = bootstrapOs();
  console.log(JSON.stringify(status, null, 2));
}

function printWave(): void {
  const report = runWave({ runResearch: true });
  console.log(JSON.stringify(report, null, 2));
}

function printResearch(): void {
  bootstrapOs();
  const result = runResearchCycle();
  console.log(
    JSON.stringify(
      {
        researchCount: result.research.length,
        tasksCreated: result.tasksCreated,
        recommendations: result.recommendations.length,
      },
      null,
      2,
    ),
  );
}

function printDailyCycle(): void {
  const result = runDailyCycle();
  console.log(
    JSON.stringify(
      {
        id: result.id,
        auditVerdict: result.audit.verdict,
        researchCount: result.research.research.length,
        taskIds: result.product.taskIds,
        buildPlans: result.developer.buildPlans.length,
        gateCommand: result.qa.gateCommand,
      },
      null,
      2,
    ),
  );
}

async function printScheduler(): Promise<void> {
  bootstrapOs();
  const result = await runDueWorkflows();
  console.log(
    JSON.stringify(
      {
        ...result,
        registered: listScheduledJobs().map((j) => `${j.id} (${j.interval})`),
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  switch (cmd) {
    case "bootstrap":
      printStatus();
      break;
    case "status":
      printStatus();
      break;
    case "wave":
      printWave();
      break;
    case "research":
      printResearch();
      break;
    case "scheduler":
    case "run-due":
      await printScheduler();
      break;
    case "daily":
    case "daily-cycle":
      printDailyCycle();
      break;
    default:
      console.error(
        `Unknown command: ${cmd}. Use: status | bootstrap | wave | research | daily | scheduler`,
      );
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
