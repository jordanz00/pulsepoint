/**
 * Quake OS — structured research discoveries that spawn tickets.
 */
import type { AgentResearch } from "@/quake-os/core/types";

export type ResearchDiscovery = {
  insight: string;
  category: AgentResearch["category"];
  priority: "P0" | "P1" | "P2" | "P3";
  businessImpact: "critical" | "high" | "medium" | "low";
  authorAgent: string;
  sources: string[];
  keywords: string[];
  suggestedAcceptanceCriteria: string[];
};

export const PAC_MANAGEMENT_DISCOVERY: ResearchDiscovery = {
  insight: "Hospital associations need better PAC management.",
  category: "nonprofit",
  priority: "P1",
  businessImpact: "high",
  authorAgent: "research-agent",
  sources: [
    "lib/pac-marketing-preview.ts",
    "docs/PRODUCT-CLAIMS.md",
    "data/quake-os/competitive-intel.json",
  ],
  keywords: ["PAC", "fundraising", "giving", "compliance", "FEC", "hospital"],
  suggestedAcceptanceCriteria: [
    "PAC contributions tracked per hospital account",
    "Illustrative vs live labels per PRODUCT-CLAIMS",
    "Tenant-isolated PAC data — getOrgDb(orgId)",
    "Staff capability gate on PAC exports",
    "Audit log on contribution mutations",
    "pnpm quake:gates passes",
  ],
};

/** Shipped BL-001 — retained for keyword search only; do not auto-spawn P1 tasks. */
export const TAKE_ACTION_SHIPPED_DISCOVERY: ResearchDiscovery = {
  insight: "[SHIPPED] Public advocacy take-action with response capture (BL-001).",
  category: "hospital_association",
  priority: "P3",
  businessImpact: "low",
  authorAgent: "research-agent",
  sources: ["lib/advocacy/submit-take-action-response.ts", "tests/e2e/advocacy-take-action.spec.ts"],
  keywords: ["advocacy", "take-action", "shipped"],
  suggestedAcceptanceCriteria: ["Regression: pnpm test:e2e advocacy"],
};

export const DEFAULT_DISCOVERIES: ResearchDiscovery[] = [
  {
    ...PAC_MANAGEMENT_DISCOVERY,
    priority: "P2",
    businessImpact: "medium",
  },
  TAKE_ACTION_SHIPPED_DISCOVERY,
];
