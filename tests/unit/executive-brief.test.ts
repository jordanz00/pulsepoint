import { describe, expect, it } from "vitest";
import { buildExecutiveBrief } from "@/lib/copilot/executive-brief";
import type { ExecutiveDashboard } from "@/lib/executive-metrics";

const sample: ExecutiveDashboard = {
  kpis: [
    {
      id: "revenue.total",
      label: "Total recorded revenue",
      value: 12500,
      unit: "usd",
      emphasis: "primary",
      group: "revenue",
    },
    {
      id: "members.active",
      label: "Active members",
      value: 42,
      unit: "count",
      emphasis: "primary",
      group: "members",
    },
    {
      id: "members.at_risk",
      label: "At-risk members",
      value: 2,
      unit: "count",
      emphasis: "secondary",
      group: "members",
    },
  ],
  revenueLines: [],
  totalRevenueCents: 1_250_000,
  duesRevenueCents: 1_000_000,
  nonDuesRevenueCents: 250_000,
  auditTrail: [
    {
      id: "a1",
      summary: "Member directory exported",
      when: new Date("2026-05-01T12:00:00Z"),
      action: "member.exported",
      kind: "import",
    },
  ],
  dataAsOf: new Date("2026-05-01T12:00:00Z"),
};

describe("buildExecutiveBrief", () => {
  it("uses only provided KPI values", () => {
    const brief = buildExecutiveBrief(sample);
    expect(brief.snapshotStats.some((s) => s.value === "$12,500")).toBe(true);
    expect(brief.snapshotStats.some((s) => s.value === "42")).toBe(true);
    expect(brief.attentionItems.some((a) => a.count === 2)).toBe(true);
    expect(brief.activityItems[0]?.summary).toContain("exported");
    expect(brief.headline).toContain("$12,500");
  });

  it("filters demo session audit noise", () => {
    const withDemo = {
      ...sample,
      auditTrail: [
        ...sample.auditTrail,
        {
          id: "d1",
          summary: "DemoSession · demo entered",
          when: new Date("2026-06-07T12:00:00Z"),
          action: "demo.entered",
          kind: "member" as const,
        },
      ],
    };
    const brief = buildExecutiveBrief(withDemo);
    expect(brief.activityItems.every((a) => !a.summary.toLowerCase().includes("demosession"))).toBe(
      true,
    );
    expect(brief.activityItems).toHaveLength(1);
  });
});
