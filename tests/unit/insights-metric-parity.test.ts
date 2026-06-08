import { describe, expect, it } from "vitest";
import {
  catalogResolvableKeys,
  metricsToValueMap,
  snapshotsMatchResolved,
  type ResolvedMetric,
} from "@/lib/report-metrics";
import { REPORT_METRIC_CATALOG } from "@/lib/report-metric-catalog";

describe("insights metric parity", () => {
  const sample: ResolvedMetric[] = [
    {
      metricKey: "members.active",
      label: "Active members",
      value: 50,
      unit: "count",
      display: "50",
    },
    {
      metricKey: "revenue.total",
      label: "Total revenue",
      value: 12000,
      unit: "usd",
      display: "$12,000",
    },
    {
      metricKey: "membership.retention_pct",
      label: "Retention rate (%)",
      value: 92,
      unit: "pct",
      display: "92%",
    },
  ];

  it("catalog keys align with resolvable metric ids", () => {
    const catalog = catalogResolvableKeys();
    expect(catalog).toEqual(REPORT_METRIC_CATALOG.map((m) => m.id));
    expect(catalog).toContain("members.active");
    expect(catalog).toContain("membership.retention_pct");
  });

  it("snapshot values match live resolved metrics", () => {
    const snapshots = [
      { metricKey: "members.active", value: 50 },
      { metricKey: "revenue.total", value: 12000 },
      { metricKey: "membership.retention_pct", value: 92 },
    ];
    expect(snapshotsMatchResolved(sample, snapshots)).toBe(true);
  });

  it("detects drift when snapshot value differs", () => {
    const snapshots = [
      { metricKey: "members.active", value: 49 },
      { metricKey: "revenue.total", value: 12000 },
      { metricKey: "membership.retention_pct", value: 92 },
    ];
    expect(snapshotsMatchResolved(sample, snapshots)).toBe(false);
  });

  it("builds value map for export parity", () => {
    const map = metricsToValueMap(sample);
    expect(map.get("members.active")).toBe(50);
    expect(map.get("revenue.total")).toBe(12000);
  });
});
