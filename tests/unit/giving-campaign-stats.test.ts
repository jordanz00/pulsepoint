import { describe, expect, it } from "vitest";
import {
  campaignProgressPct,
  sumRaisedCents,
} from "@/lib/giving/campaign-stats";

describe("giving campaign stats", () => {
  it("sums only paid gifts", () => {
    expect(
      sumRaisedCents([
        { amountCents: 5000, paidAt: new Date() },
        { amountCents: 10000, paidAt: null },
        { amountCents: 2500, paidAt: new Date() },
      ]),
    ).toBe(7500);
  });

  it("calculates progress toward goal", () => {
    expect(campaignProgressPct(25000, 100000)).toBe(25);
    expect(campaignProgressPct(150000, 100000)).toBe(100);
  });

  it("returns null progress when no goal", () => {
    expect(campaignProgressPct(5000, 0)).toBeNull();
  });
});
