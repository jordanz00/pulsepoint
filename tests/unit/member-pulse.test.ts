import { describe, expect, it } from "vitest";
import { parseMemberPulseSnapshot } from "@/lib/member-pulse/compute";
import { MEMBER_PULSE_DIMENSION_IDS } from "@/lib/member-pulse/types";
import { SPEAKER_ROLE_WEIGHT } from "@/lib/member-pulse/constants";
import { tierFromScore } from "@/lib/engagement-score";

describe("parseMemberPulseSnapshot", () => {
  it("returns null for invalid payloads", () => {
    expect(parseMemberPulseSnapshot(null)).toBeNull();
    expect(parseMemberPulseSnapshot({ overall: 50 })).toBeNull();
  });

  it("parses a valid snapshot", () => {
    const snapshot = {
      overall: 72,
      overallTier: "active",
      computedAt: new Date().toISOString(),
      dimensions: MEMBER_PULSE_DIMENSION_IDS.map((id) => ({
        id,
        label: id,
        score: 60,
        tier: "moderate",
        summary: "test",
        metrics: [],
        highlights: [],
      })),
    };
    const parsed = parseMemberPulseSnapshot(snapshot);
    expect(parsed?.overall).toBe(72);
    expect(parsed?.dimensions).toHaveLength(5);
  });
});

describe("tierFromScore", () => {
  it("marks high scores as active", () => {
    expect(tierFromScore(85, null)).toBe("active");
  });

  it("flags overdue renewal as at risk", () => {
    expect(tierFromScore(70, -3)).toBe("at_risk");
  });
});

describe("SPEAKER_ROLE_WEIGHT", () => {
  it("ranks keynote above moderator", () => {
    expect(SPEAKER_ROLE_WEIGHT.KEYNOTE).toBeGreaterThan(SPEAKER_ROLE_WEIGHT.MODERATOR);
  });
});
