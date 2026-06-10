import { describe, expect, it } from "vitest";
import {
  TOP_20_FEATURES,
  TOP_20_TIER1,
  TOP_20_TIER2,
  featureHref,
} from "@/lib/top-20-features";
import { buildHealthSystemTrees } from "@/lib/enterprise/health-system-governance";

describe("Top 20 features registry", () => {
  it("defines exactly 20 features", () => {
    expect(TOP_20_FEATURES).toHaveLength(20);
    expect(TOP_20_TIER1).toHaveLength(10);
    expect(TOP_20_TIER2).toHaveLength(10);
  });

  it("has unique ranks and ids", () => {
    const ranks = TOP_20_FEATURES.map((f) => f.rank);
    const ids = TOP_20_FEATURES.map((f) => f.id);
    expect(new Set(ranks).size).toBe(20);
    expect(new Set(ids).size).toBe(20);
  });

  it("resolves org and marketing hrefs", () => {
    expect(featureHref("demo-healthcare", TOP_20_FEATURES[0]!)).toBe(
      "/demo-healthcare/leadership",
    );
    expect(featureHref("demo-healthcare", TOP_20_FEATURES[3]!)).toBe("/#why-pulsepoint");
    expect(featureHref("demo-healthcare", TOP_20_FEATURES[19]!)).toBe("/compare-protech");
  });

  it("supports dynamic member 360 path override", () => {
    const member360 = TOP_20_FEATURES.find((f) => f.id === "member-360")!;
    expect(
      featureHref("demo-healthcare", member360, {
        value: "92",
        label: "Avery Reyes",
        pathOverride: "/members/abc123",
      }),
    ).toBe("/demo-healthcare/members/abc123");
  });
});

describe("buildHealthSystemTrees", () => {
  it("builds hierarchy for governance showcase stat", () => {
    const { trees } = buildHealthSystemTrees([
      {
        id: "s1",
        name: "System A",
        type: "HEALTH_SYSTEM",
        parentId: null,
        memberCount: 1,
        childCount: 1,
      },
      {
        id: "h1",
        name: "Hospital A",
        type: "HOSPITAL",
        parentId: "s1",
        memberCount: 4,
        childCount: 0,
      },
    ]);
    expect(trees[0]?.children).toHaveLength(1);
  });
});
