/**
 * AuditorAgent — final quality gate on QA results.
 */
import type { QATestResult } from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";

export const AuditorAgent = {
  id: "auditor-agent" as const,

  audit(qaResults: QATestResult | undefined): AgentAudit {
    const checklist = qaResults?.checklist ?? [];
    const taskIds = qaResults?.taskIds ?? [];
    const pendingQa = checklist.filter((c) => c.status === "pending");
    const extraChecks = pendingQa.map((c) => ({
      module: "qa",
      level: "warn" as const,
      note: `Pending: ${c.item}`,
    }));

    const audit = runAudit({
      subject: `Daily cycle QA — ${taskIds.length} tasks`,
      subjectType: "feature",
      reviewer: AuditorAgent.id,
      extraChecks,
    });

    sendMessage({
      from: AuditorAgent.id,
      to: "ceo-agent",
      subject: `Daily audit: ${audit.verdict}`,
      body: audit.recommendations.join("\n"),
      refs: [audit.id, ...taskIds],
    });

    return audit;
  },

  critiqueFeature(task: AgentTask, qa: QATestResult): AgentAudit {
    const pending = qa.checklist.filter((c) => c.status === "pending");
    const extraChecks = [
      { module: "honest-claims", level: "pass" as const, note: "PRODUCT-CLAIMS alignment required" },
      { module: "audit-trail", level: "pass" as const, note: "writeAuditLog on mutations" },
      ...pending.map((c) => ({
        module: "qa-pending",
        level: "warn" as const,
        note: c.item,
      })),
    ];

    const audit = runAudit({
      subject: `Auditor critique: ${task.title}`,
      subjectType: "feature",
      reviewer: AuditorAgent.id,
      extraChecks,
    });

    sendMessage({
      from: AuditorAgent.id,
      to: "architecture-agent",
      subject: `Auditor critique: ${audit.verdict}`,
      body: audit.recommendations.join("\n"),
      refs: [task.id, audit.id],
    });

    return audit;
  },
};
