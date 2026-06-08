import { describe, expect, it } from "vitest";
import type { CeoCommandCenterData } from "@/lib/ceo-command-center-data";

const sample: CeoCommandCenterData = {
  orgName: "Demo Association",
  dataAsOf: new Date("2026-06-01T12:00:00Z"),
  members: {
    total: 420,
    joinedThisMonth: 12,
    growthDelta: 3,
    atRisk: 2,
    lapsed: 1,
    renewalsDue30: 5,
    trend: [{ label: "Jan", value: 8 }],
  },
  revenue: {
    mtdCents: 125_000_00,
    deltaPct: 4,
    atRiskMemberCount: 8,
    trend: [{ label: "Jan", value: 10000 }],
    duesPct: 72,
    nonDuesPct: 28,
  },
  events: {
    published: 6,
    upcoming: 2,
    highlights: [],
  },
  committees: {
    total: 4,
    alerts: [],
  },
  advocacy: {
    activeCount: 1,
    issues: [],
  },
  executiveReview: [
    {
      id: "renewals",
      priority: "high",
      title: "5 renewals due in 30 days",
      summary: "Membership revenue at risk without timely outreach.",
      href: "/demo/members/renewals",
    },
  ],
};

describe("CEO command center data shape", () => {
  it("covers all seven executive questions", () => {
    expect(sample.members.total).toBeGreaterThan(0);
    expect(sample.members.growthDelta).toBeDefined();
    expect(sample.events.highlights).toBeDefined();
    expect(sample.revenue.atRiskMemberCount).toBeGreaterThan(0);
    expect(sample.committees.alerts).toBeDefined();
    expect(sample.advocacy.activeCount).toBeGreaterThanOrEqual(0);
    expect(sample.executiveReview.length).toBeGreaterThan(0);
  });
});
