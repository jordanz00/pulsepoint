import { describe, expect, it } from "vitest";
import {
  buildCommandCenterOpsCards,
  buildCommandCenterOperatorPanels,
} from "@/lib/command-center-ops";
import type { CeoCommandCenterData } from "@/lib/ceo-command-center-data";

const data = {
  orgName: "Sterling Healthcare Association",
  dataAsOf: new Date("2026-06-11T12:00:00Z"),
  members: {
    total: 50,
    joinedThisMonth: 3,
    growthDelta: 2,
    atRisk: 2,
    lapsed: 1,
    renewalsDue30: 4,
    trend: [],
  },
  revenue: {
    mtdCents: 28400000,
    deltaPct: 8,
    atRiskMemberCount: 7,
    trend: [],
    duesPct: 60,
    nonDuesPct: 40,
  },
  events: { published: 4, upcoming: 2, highlights: [] },
  committees: { total: 5, alerts: [{ id: "1", name: "Finance", memberCount: 0, reason: "Empty" }] },
  advocacy: { activeCount: 2, issues: [] },
  executiveReview: [{ id: "i1", priority: "high", title: "Renewals", summary: "Review", href: "/x" }],
} as CeoCommandCenterData;

const ops = {
  exceptionCount: 2,
  pendingImportBatches: 1,
  highPriorityReviewCount: 1,
  committeeAlertCount: 1,
  atRiskMemberCount: 7,
  dataAsOf: data.dataAsOf,
};

describe("command-center-ops", () => {
  it("builds five executive questions", () => {
    const cards = buildCommandCenterOpsCards(data, ops, "demo-healthcare");
    expect(cards).toHaveLength(5);
    expect(cards[1]!.tone).toBe("attention");
    expect(cards[2]!.answer).toMatch(/import/i);
  });

  it("builds operator panels with action status when exceptions exist", () => {
    const panels = buildCommandCenterOperatorPanels(ops, "demo-healthcare");
    expect(panels).toHaveLength(3);
    expect(panels[0]!.status).toBe("action");
    expect(panels[2]!.value).toBe("Review");
  });
});
