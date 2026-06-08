import { describe, expect, it } from "vitest";
import { ADVOCACY_MARKETING } from "@/lib/marketing-home";
import {
  ADVOCACY_PREVIEW_BILLS,
  ADVOCACY_PREVIEW_CAMPAIGNS,
  ADVOCACY_PREVIEW_ISSUES,
  ADVOCACY_PREVIEW_KPIS,
  ADVOCACY_PREVIEW_ROSTER,
} from "@/lib/advocacy-marketing-preview";

describe("Advocacy marketing", () => {
  it("defines three capability outcomes with features", () => {
    expect(ADVOCACY_MARKETING.outcomes).toHaveLength(3);
    for (const o of ADVOCACY_MARKETING.outcomes) {
      expect(o.features.length).toBeGreaterThanOrEqual(4);
      expect(o.proof.length).toBeGreaterThan(10);
    }
  });

  it("marks module as alpha in proof strip", () => {
    expect(ADVOCACY_MARKETING.proofStrip.join(" ").toLowerCase()).toContain("alpha");
    expect(ADVOCACY_MARKETING.disclaimer.toLowerCase()).toContain("alpha");
  });

  it("preview data supports focus-mode demo", () => {
    expect(ADVOCACY_PREVIEW_KPIS.length).toBeGreaterThanOrEqual(4);
    expect(ADVOCACY_PREVIEW_ISSUES.length).toBeGreaterThanOrEqual(4);
    expect(ADVOCACY_PREVIEW_BILLS.length).toBeGreaterThanOrEqual(3);
    expect(ADVOCACY_PREVIEW_CAMPAIGNS.length).toBeGreaterThanOrEqual(3);
    expect(ADVOCACY_PREVIEW_ROSTER.length).toBeGreaterThanOrEqual(4);
  });

  it("uses professional headline — not generic one-liner", () => {
    expect(ADVOCACY_MARKETING.headline).not.toMatch(/one screen/i);
    expect(ADVOCACY_MARKETING.lead.length).toBeGreaterThan(80);
  });
});
