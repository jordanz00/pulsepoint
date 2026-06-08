import { describe, expect, it } from "vitest";
import { PAC_MARKETING } from "@/lib/marketing-home";
import {
  PAC_LINKED_ISSUES,
  PAC_PREVIEW_CONTRIBUTORS,
  PAC_PREVIEW_KPIS,
  PAC_PREVIEW_LAWMAKERS,
} from "@/lib/pac-marketing-preview";

describe("Hospital PAC marketing", () => {
  it("defines three plain-language outcomes", () => {
    expect(PAC_MARKETING.outcomes).toHaveLength(3);
    for (const o of PAC_MARKETING.outcomes) {
      expect(o.features.length).toBeGreaterThanOrEqual(4);
      expect(o.body.length).toBeLessThan(120);
      expect(o.title.length).toBeLessThan(40);
    }
  });

  it("marks PAC as preview in proof strip", () => {
    const strip = PAC_MARKETING.proofStrip.join(" ").toLowerCase();
    expect(strip).toMatch(/preview|sample|filing|fec|counsel/);
    expect(PAC_MARKETING.disclaimer.toLowerCase()).toContain("preview");
  });

  it("uses political plain language in lead", () => {
    expect(PAC_MARKETING.lead.toLowerCase()).toMatch(/lawmaker|political|pac/);
    expect(PAC_MARKETING.headline).not.toMatch(/win on policy/i);
  });

  it("preview data supports focus-mode demo", () => {
    expect(PAC_PREVIEW_KPIS.length).toBe(4);
    expect(PAC_PREVIEW_CONTRIBUTORS.length).toBeGreaterThanOrEqual(4);
    expect(PAC_LINKED_ISSUES.every((i) => i.politicalNote.length > 5)).toBe(true);
    expect(PAC_PREVIEW_LAWMAKERS.length).toBeGreaterThanOrEqual(4);
  });
});
