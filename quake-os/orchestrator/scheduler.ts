/**
 * Quake OS — workflow scheduler (runs registered schedule jobs).
 */
import "@/quake-os/orchestrator/scheduled-jobs";
import { runDueJobs, listScheduledJobs } from "@/quake-os/orchestrator/schedule";

export { schedule, runDueJobs, listScheduledJobs } from "@/quake-os/orchestrator/schedule";

/** Run all due scheduled jobs (daily cycle, research, weekly wave). */
export async function runDueWorkflows() {
  return runDueJobs();
}
