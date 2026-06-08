import { describe, expect, it } from "vitest";
import { buildBoardPackHtml } from "@/lib/board-pack/build-board-pack-html";
import { buildExecutiveBrief } from "@/lib/copilot/executive-brief";
import type { ExecutiveDashboard } from "@/lib/executive-metrics";

const sampleDashboard: ExecutiveDashboard = {
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
  ],
  revenueLines: [
    { id: "dues", label: "Membership dues", amountCents: 1_000_000 },
    { id: "events", label: "Events", amountCents: 250_000 },
  ],
  totalRevenueCents: 1_250_000,
  duesRevenueCents: 1_000_000,
  nonDuesRevenueCents: 250_000,
  auditTrail: [],
  dataAsOf: new Date("2026-05-01T12:00:00Z"),
};

describe("buildBoardPackHtml", () => {
  it("includes KPIs, trend, revenue table, and brief sections", () => {
    const brief = buildExecutiveBrief(sampleDashboard);
    const html = buildBoardPackHtml({
      orgName: "Sterling Healthcare Association",
      orgSlug: "demo-healthcare",
      dashboard: sampleDashboard,
      brief,
      charts: {
        revenueTrend: [
          { label: "Jan", value: 100 },
          { label: "Feb", value: 120 },
        ],
        duesPct: 80,
        nonDuesPct: 20,
      },
      deltas: {
        "revenue.total": { label: "+5% vs last month", direction: "up" },
      },
      generatedAt: new Date("2026-06-08T12:00:00Z"),
    });

    expect(html).toContain("Sterling Healthcare Association");
    expect(html).toContain("Total recorded revenue");
    expect(html).toContain("Revenue trend");
    expect(html).toContain("Revenue by source");
    expect(html).toContain("At a glance");
    expect(html).toContain("Needs attention");
    expect(html).toContain("+5% vs last month");
    expect(html).toContain("80%");
    expect(html).toContain("20%");
  });

  it("escapes HTML in org name and brief lines", () => {
    const dash: ExecutiveDashboard = {
      ...sampleDashboard,
      kpis: [
        {
          id: "members.active",
          label: "Active <script>",
          value: 1,
          unit: "count",
          emphasis: "primary",
          group: "members",
        },
      ],
    };
    const brief = buildExecutiveBrief(dash);
    const html = buildBoardPackHtml({
      orgName: 'Test & "Co"',
      orgSlug: "demo",
      dashboard: dash,
      brief,
      charts: { revenueTrend: [], duesPct: 0, nonDuesPct: 0 },
      generatedAt: new Date(),
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("Active &lt;script&gt;");
    expect(html).toContain("Test &amp; &quot;Co&quot;");
  });

  it("handles empty brief gracefully", () => {
    const emptyBrief = buildExecutiveBrief({
      ...sampleDashboard,
      kpis: [],
      auditTrail: [],
    });
    const html = buildBoardPackHtml({
      orgName: "Empty Org",
      orgSlug: "empty",
      dashboard: { ...sampleDashboard, kpis: [] },
      brief: emptyBrief,
      charts: { revenueTrend: [], duesPct: 0, nonDuesPct: 0 },
      generatedAt: new Date(),
    });

    expect(html).toContain("No summary lines");
    expect(html).toContain("All clear");
  });
});
