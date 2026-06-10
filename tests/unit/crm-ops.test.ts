import { describe, expect, it } from "vitest";
import {
  buildCrmOpsCards,
  buildCrmOperatorPanels,
  buildCrmRelationshipQueue,
} from "@/lib/crm-ops";

const snapshot = {
  dataAsOf: new Date("2026-06-11T12:00:00Z"),
  activeMembers: 120,
  hospitalAccounts: 11,
  followUpsDue7d: 8,
  overdueFollowUps: 2,
  atRiskCount: 3,
  duplicateGroups: 1,
  activeWorkflows: 4,
  activeWorkflowRuns: 2,
  openDeals: 5,
  openPipelineValueCents: 25000000,
  upcomingFollowUps: [
    {
      id: "m1",
      name: "Avery Khan",
      nextFollowUpAt: new Date("2026-06-09"),
      relationshipHealth: "HEALTHY",
    },
  ],
  atRiskPreview: [
    {
      id: "m2",
      name: "Jordan Lee",
      nextFollowUpAt: new Date("2026-06-12"),
      relationshipHealth: "AT_RISK",
    },
  ],
};

describe("crm-ops", () => {
  it("flags attention when follow-ups overdue", () => {
    const cards = buildCrmOpsCards(snapshot, "demo-healthcare");
    expect(cards.find((c) => c.id === "attention")?.tone).toBe("attention");
  });

  it("builds operator panels with follow-up action status", () => {
    const panels = buildCrmOperatorPanels(snapshot, "demo-healthcare");
    expect(panels.find((p) => p.id === "followups")?.status).toBe("action");
  });

  it("queues at-risk and overdue follow-ups", () => {
    const queue = buildCrmRelationshipQueue(snapshot, "demo-healthcare");
    expect(queue.some((q) => q.priority === "high")).toBe(true);
    expect(queue.some((q) => q.id === "duplicates")).toBe(true);
  });
});
