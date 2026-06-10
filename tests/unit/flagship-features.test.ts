import { describe, expect, it } from "vitest";
import {
  FLAGSHIP_FEATURES,
  getFlagshipFeatureById,
  resolveFlagshipPath,
  flagshipHubHref,
  flagshipChildHref,
} from "@/lib/flagship-features";
import {
  FLAGSHIP_WALKTHROUGH_STEPS,
  flagshipWalkthroughRegistryAligned,
  flagshipWalkthroughTotalMinutes,
} from "@/lib/flagship-walkthrough";

const ALLOWED_STATUS = new Set(["live", "alpha", "demo"]);

describe("Flagship 5 features registry", () => {
  it("defines exactly 5 features", () => {
    expect(FLAGSHIP_FEATURES).toHaveLength(5);
  });

  it("has unique ranks and ids", () => {
    const ranks = FLAGSHIP_FEATURES.map((f) => f.rank);
    const ids = FLAGSHIP_FEATURES.map((f) => f.id);
    expect(new Set(ranks).size).toBe(5);
    expect(new Set(ids).size).toBe(5);
  });

  it("uses allowed status labels", () => {
    for (const f of FLAGSHIP_FEATURES) {
      expect(ALLOWED_STATUS.has(f.status)).toBe(true);
    }
  });

  it("maps stat keys for every flagship id", () => {
    for (const f of FLAGSHIP_FEATURES) {
      expect(f.statKeys.length).toBeGreaterThan(0);
      expect(getFlagshipFeatureById(f.id)).toBeDefined();
    }
  });

  it("resolves org and site hrefs", () => {
    const exec = FLAGSHIP_FEATURES[0]!;
    expect(flagshipHubHref("demo-healthcare", exec)).toBe(
      "/demo-healthcare/flagship/executive",
    );
    expect(resolveFlagshipPath("demo-healthcare", "/command-center")).toBe(
      "/demo-healthcare/command-center",
    );
    expect(resolveFlagshipPath("demo-healthcare", "/compare-protech")).toBe(
      "/compare-protech",
    );
  });

  it("resolves child routes", () => {
    const migration = getFlagshipFeatureById("migration-honest")!;
    expect(flagshipChildHref("demo-healthcare", migration.childRoutes[1]!)).toBe(
      "/compare-protech",
    );
    expect(flagshipChildHref("demo-healthcare", migration.childRoutes[0]!)).toBe(
      "/demo-healthcare/members/imports",
    );
  });

  it("aligns walkthrough steps with registry", () => {
    expect(FLAGSHIP_WALKTHROUGH_STEPS).toHaveLength(5);
    expect(flagshipWalkthroughRegistryAligned()).toBe(true);
    expect(flagshipWalkthroughTotalMinutes()).toBeGreaterThan(10);
  });
});
