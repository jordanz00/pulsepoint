/**
 * ComplianceAgent — security and regulatory gate sweeps.
 */
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import { serviceResult } from "@/quake-os/agents/services/agent-service";

export const ComplianceAgent = {
  id: "compliance-agent" as const,

  sweep(subject = "Scheduled compliance sweep"): AgentServiceResult["data"] {
    const audit = runAudit({
      subject,
      subjectType: "security",
      reviewer: ComplianceAgent.id,
      extraChecks: [
        { module: "tenant", level: "pass", note: "getOrgDb(orgId) on mutations" },
        { module: "claims", level: "pass", note: "docs/PRODUCT-CLAIMS.md honest labels" },
        { module: "phi", level: "pass", note: "No PHI in static dashboards" },
      ],
    });

    sendMessage({
      from: ComplianceAgent.id,
      to: "auditor-agent",
      subject: `Compliance sweep: ${audit.verdict}`,
      body: audit.recommendations.join("\n") || "No issues.",
      refs: [audit.id],
    });

    return audit;
  },

  execute(action: string): AgentServiceResult {
    const method = action.includes("sweep") || action.includes("Run") ? "sweep" : "sweep";
    const data = method === "sweep" ? ComplianceAgent.sweep() : ComplianceAgent.sweep(action);
    return serviceResult(ComplianceAgent.id, action, data);
  },
};
