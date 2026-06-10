/**
 * Quake OS — corporation structure (divisions, reporting lines, mandates).
 *
 * WHO THIS IS FOR: Orchestrator, Mission Control UI, automation prompts.
 * WHAT IT DOES: Defines the full AI corporation org chart as machine-readable divisions.
 * HOW IT CONNECTS: corporation-orchestrator.ts dispatches by division; registry.json agents map here.
 */
import type { AgentId } from "@/quake-os/core/types";

export type CorporationDivision = {
  id: string;
  name: string;
  leadAgentId: AgentId;
  agents: AgentId[];
  mandate: string;
  cadence: "continuous" | "daily" | "weekly" | "on-demand";
};

/** Full corporation — 7 divisions, 12+ agents. */
export const CORPORATION_DIVISIONS: CorporationDivision[] = [
  {
    id: "executive",
    name: "Executive",
    leadAgentId: "ceo-agent",
    agents: ["ceo-agent", "cto-agent"],
    mandate: "Strategy, prioritization, resource allocation, final ship verdicts",
    cadence: "daily",
  },
  {
    id: "research",
    name: "Research & Intelligence",
    leadAgentId: "research-agent",
    agents: ["research-agent"],
    mandate: "Competitive intel, association trends, AMS market monitoring, auto-backlog",
    cadence: "daily",
  },
  {
    id: "product",
    name: "Product",
    leadAgentId: "product-agent",
    agents: ["product-agent"],
    mandate: "Requirements, user stories, acceptance criteria, backlog health",
    cadence: "daily",
  },
  {
    id: "engineering",
    name: "Engineering",
    leadAgentId: "developer-agent",
    agents: ["developer-agent", "architecture-agent", "qa-agent"],
    mandate: "Build plans, architecture review, quality gates, performance",
    cadence: "daily",
  },
  {
    id: "compliance",
    name: "Compliance & Audit",
    leadAgentId: "compliance-agent",
    agents: ["compliance-agent", "auditor-agent"],
    mandate: "HIPAA readiness, tenant isolation, independent quality gate",
    cadence: "continuous",
  },
  {
    id: "industry",
    name: "Industry Expertise",
    leadAgentId: "healthcare-sme-agent",
    agents: ["healthcare-sme-agent", "hospital-association-agent"],
    mandate: "Healthcare association fit, advocacy realism, CE/credentialing honesty",
    cadence: "weekly",
  },
  {
    id: "documentation",
    name: "Documentation",
    leadAgentId: "documentation-agent",
    agents: ["documentation-agent"],
    mandate: "Technical, API, architecture docs synchronized with code",
    cadence: "continuous",
  },
];

export function listCorporationAgents(): AgentId[] {
  const seen = new Set<AgentId>();
  for (const div of CORPORATION_DIVISIONS) {
    for (const agent of div.agents) seen.add(agent);
  }
  return [...seen];
}

export function getDivision(agentId: AgentId): CorporationDivision | undefined {
  return CORPORATION_DIVISIONS.find((d) => d.agents.includes(agentId));
}

export function getCorporationSummary(): {
  divisions: number;
  agents: number;
  divisionsList: { id: string; name: string; lead: string; agentCount: number }[];
} {
  const agents = listCorporationAgents();
  return {
    divisions: CORPORATION_DIVISIONS.length,
    agents: agents.length,
    divisionsList: CORPORATION_DIVISIONS.map((d) => ({
      id: d.id,
      name: d.name,
      lead: d.leadAgentId,
      agentCount: d.agents.length,
    })),
  };
}
