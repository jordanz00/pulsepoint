/**
 * Quake OS — default scheduled jobs.
 *
 * schedule.every().day.do(orchestrator.runDailyCycle)
 */
import { AgentOrchestrator } from "@/quake-os/orchestrator/agent-orchestrator";
import { runCorporationCycle } from "@/quake-os/orchestrator/corporation-orchestrator";
import { runResearchCycle } from "@/quake-os/core/research-engine";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { runWorkflow } from "@/quake-os/core/workflow-engine";
import { schedule } from "@/quake-os/orchestrator/schedule";

const orchestrator = new AgentOrchestrator();

schedule.every().day.do(() => {
  orchestrator.runDailyCycle();
}, "daily-cycle");

schedule.every().day.do(() => {
  runResearchCycle();
}, "daily-research");

schedule.every().week.do(() => {
  refreshBacklog(["ams", "audits"]);
  runWorkflow("continuous-improvement");
}, "continuous-improvement");

schedule.every().week.do(() => {
  runCorporationCycle();
}, "corporation-cycle");
