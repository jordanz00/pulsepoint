import { describe, expect, it } from "vitest";
import { ASSOCIATION_SPINE_MARKETING } from "@/lib/marketing-home";

describe("association spine marketing", () => {
  it("defines three lanes with consistent spine steps", () => {
    expect(ASSOCIATION_SPINE_MARKETING.lanes).toHaveLength(3);
    for (const lane of ASSOCIATION_SPINE_MARKETING.lanes) {
      expect(lane.spineStep.length).toBeGreaterThan(2);
      expect(lane.signals).toHaveLength(3);
      expect(lane.modules.length).toBeGreaterThan(0);
    }
  });

  it("uses association-generic copy not hospital-only labels", () => {
    const text = JSON.stringify(ASSOCIATION_SPINE_MARKETING).toLowerCase();
    expect(text).not.toContain("active hospitals");
    expect(text).toContain("members");
  });

  it("fixes spine flow endpoints", () => {
    expect(ASSOCIATION_SPINE_MARKETING.spineStart).toBe("MemberCore");
    expect(ASSOCIATION_SPINE_MARKETING.spineEnd).toBe("Insights");
  });
});
