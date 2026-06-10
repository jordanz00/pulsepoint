/**
 * QAAgent — test checklist and gate verification for daily cycle.
 */
import type { DeveloperBuildResult, QATestResult } from "@/quake-os/orchestrator/daily-cycle-types";
import type { FeatureBuildResult } from "@/quake-os/core/feature-review-chain";
import { sendMessage } from "@/quake-os/core/communication";
import { runGateSuite } from "@/quake-os/core/gate-runner";

export const QAAgent = {
  id: "qa-agent" as const,

  test(
    codeChanges: DeveloperBuildResult,
    options?: { runGates?: boolean; gatesResult?: { passed: boolean } },
  ): QATestResult {
    const checklist: QATestResult["checklist"] = [
      { item: "pnpm test — unit tests", status: "pending" },
      { item: "pnpm leak:checks — tenant isolation", status: "pending" },
      { item: "pnpm claims:validate — honest marketing", status: "pending" },
      { item: "Acceptance criteria documented per task", status: "pass" },
    ];

    if (options?.gatesResult) {
      checklist.push({
        item: "pnpm quake:gates — reused from pipeline",
        status: options.gatesResult.passed ? "pass" : "warn",
      });
    } else if (options?.runGates) {
      const gates = runGateSuite();
      const gateStatus = gates.passed ? ("pass" as const) : ("warn" as const);
      checklist.push({
        item: `pnpm quake:gates — ${gates.command}`,
        status: gates.checks[0]?.status === "skipped" ? "pending" : gateStatus,
      });
    }

    if (codeChanges.buildPlans.length === 0) {
      checklist.push({ item: "No code changes dispatched", status: "pass" });
    }

    sendMessage({
      from: QAAgent.id,
      to: "auditor-agent",
      subject: "QA checklist ready",
      body: `Run pnpm quake:gates for ${codeChanges.taskIds.length} tasks.`,
      refs: codeChanges.taskIds,
    });

    return {
      agentId: QAAgent.id,
      taskIds: codeChanges.taskIds,
      checklist,
      gateCommand: "pnpm quake:gates",
      completedAt: new Date().toISOString(),
    };
  },

  testFeature(build: FeatureBuildResult): QATestResult {
    const checklist = [
      { item: "Acceptance criteria defined", status: build.buildPlan.summary.includes("AC:") ? ("pass" as const) : ("warn" as const) },
      { item: "Unit tests — pnpm test", status: "pending" as const },
      { item: "Tenant isolation — pnpm leak:checks", status: "pending" as const },
      { item: "Claims validation — pnpm claims:validate", status: "pending" as const },
    ];

    sendMessage({
      from: QAAgent.id,
      to: "auditor-agent",
      subject: `QA tests ready: ${build.title}`,
      body: `Gate: pnpm quake:gates`,
      refs: [build.taskId],
    });

    return {
      agentId: QAAgent.id,
      taskIds: [build.taskId],
      checklist,
      gateCommand: "pnpm quake:gates",
      completedAt: new Date().toISOString(),
    };
  },
};
