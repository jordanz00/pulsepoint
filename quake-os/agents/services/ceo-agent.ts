/**
 * CeoAgent — final ship approval after full critique chain.
 */
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { recordDecision } from "@/quake-os/core/planning-engine";
import { sendMessage } from "@/quake-os/core/communication";
import type { CeoApprovalResult } from "@/quake-os/core/feature-review-chain";

export const CeoAgent = {
  id: "ceo-agent" as const,

  approveFeature(
    task: AgentTask,
    critiques: {
      auditor: AgentAudit;
      architecture: AgentAudit;
      healthcareSme: AgentAudit;
    },
  ): CeoApprovalResult {
    const priorVerdicts: Record<string, string> = {
      auditor: critiques.auditor.verdict,
      architecture: critiques.architecture.verdict,
      healthcareSme: critiques.healthcareSme.verdict,
    };

    const anyRejected = Object.values(critiques).some((a) => a.verdict === "REJECTED");
    const anyRevision = Object.values(critiques).some((a) => a.verdict === "NEEDS_REVISION");

    let verdict: CeoApprovalResult["verdict"] = "SHIP";
    if (anyRejected) verdict = "REJECT";
    else if (anyRevision) verdict = "REVISE";

    const approved = verdict === "SHIP";

    const rationale = approved
      ? `All critiques passed. Ship ${task.title}.`
      : verdict === "REVISE"
        ? `Revise ${task.title} per critique notes before external pilot.`
        : `Reject ${task.title} — blocker in critique chain.`;

    recordDecision({
      title: `CEO ${verdict}: ${task.title}`,
      context: JSON.stringify(priorVerdicts),
      decision: rationale,
      alternatives: ["Defer", "Ship to demo only", "Escalate to CTO"],
      decidedBy: CeoAgent.id,
    });

    sendMessage({
      from: CeoAgent.id,
      to: approved ? "documentation-agent" : "developer-agent",
      subject: `CEO ${verdict}: ${task.title}`,
      body: rationale,
      refs: [task.id],
    });

    return {
      agentId: CeoAgent.id,
      taskId: task.id,
      approved,
      verdict,
      rationale,
      priorVerdicts,
      completedAt: new Date().toISOString(),
    };
  },
};
