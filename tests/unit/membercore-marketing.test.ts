import { describe, expect, it } from "vitest";
import { MEMBERCORE_MARKETING } from "@/lib/marketing-home";
import {
  MEMBERCORE_PREVIEW_MEMBERS,
  MEMBERCORE_PREVIEW_PULSE_DIMS,
  MEMBERCORE_PREVIEW_ROLE_GROUPS,
} from "@/lib/membercore-marketing-preview";

describe("MemberCore marketing", () => {
  it("defines three capability outcomes with features", () => {
    expect(MEMBERCORE_MARKETING.outcomes).toHaveLength(3);
    for (const o of MEMBERCORE_MARKETING.outcomes) {
      expect(o.features.length).toBeGreaterThanOrEqual(4);
      expect(o.proof.length).toBeGreaterThan(10);
    }
  });

  it("marks module as live in proof strip", () => {
    expect(MEMBERCORE_MARKETING.proofStrip.join(" ").toLowerCase()).toContain("live");
  });

  it("preview data supports full featured demo", () => {
    expect(MEMBERCORE_PREVIEW_MEMBERS.length).toBeGreaterThanOrEqual(5);
    expect(MEMBERCORE_PREVIEW_PULSE_DIMS.length).toBe(4);
    expect(MEMBERCORE_PREVIEW_ROLE_GROUPS.length).toBe(3);
  });
});
