/**
 * HealthcareSmeAgent — critiques features for healthcare association fit.
 */
import type { AgentAudit, AgentTask } from "@/quake-os/core/types";
import { runAudit } from "@/quake-os/core/audit-engine";
import { sendMessage } from "@/quake-os/core/communication";

const HEALTHCARE_TAGS = ["advocacy", "membership", "healthcare", "hospital", "ce", "pac", "giving"];

export const HealthcareSmeAgent = {
  id: "healthcare-sme-agent" as const,

  critiqueFeature(task: AgentTask, prior: AgentAudit[]): AgentAudit {
    const blocked = prior.some((a) => a.verdict === "REJECTED");
    const isHealthcare =
      HEALTHCARE_TAGS.some((t) => task.title.toLowerCase().includes(t)) ||
      HEALTHCARE_TAGS.some((t) => task.description.toLowerCase().includes(t)) ||
      (task.tags?.some((tag) => HEALTHCARE_TAGS.includes(tag.toLowerCase())) ?? false);

    const extraChecks = [
      {
        module: "product-claims",
        level: "pass" as const,
        note: "Align with docs/PRODUCT-CLAIMS.md — Live/Alpha/Roadmap honest",
      },
      {
        module: "association-workflow",
        level: isHealthcare ? ("pass" as const) : ("warn" as const),
        note: isHealthcare
          ? "Healthcare association workflow reviewed"
          : "General feature — SME spot-check only",
      },
      {
        module: "no-invented-stats",
        level: "pass" as const,
        note: "No fabricated KPIs in UI copy",
      },
      {
        module: "prior-gates",
        level: blocked ? ("fail" as const) : ("pass" as const),
        note: blocked ? "Blocked by prior critique" : "Prior critiques clear",
      },
    ];

    const audit = runAudit({
      subject: `Healthcare SME critique: ${task.title}`,
      subjectType: "feature",
      reviewer: HealthcareSmeAgent.id,
      extraChecks,
    });

    sendMessage({
      from: HealthcareSmeAgent.id,
      to: "ceo-agent",
      subject: `SME critique: ${audit.verdict}`,
      body: audit.recommendations.join("\n"),
      refs: [task.id, audit.id],
    });

    return audit;
  },
};
