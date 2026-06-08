import { describe, expect, it } from "vitest";
import { INSIGHTS_MARKETING } from "@/lib/marketing-home";

describe("Insights marketing copy", () => {
  it("has three executive outcomes with proof lines", () => {
    expect(INSIGHTS_MARKETING.outcomes).toHaveLength(3);
    for (const o of INSIGHTS_MARKETING.outcomes) {
      expect(o.title.length).toBeGreaterThan(4);
      expect(o.proof.length).toBeGreaterThan(10);
    }
  });

  it("states honest alpha scope in proof strip", () => {
    const joined = INSIGHTS_MARKETING.proofStrip.join(" ");
    expect(joined.toLowerCase()).toContain("alpha");
    expect(joined.toLowerCase()).toContain("roadmap");
  });

  it("links to insights demo workspace", () => {
    expect(INSIGHTS_MARKETING.demoHref).toContain("insights");
  });
});
