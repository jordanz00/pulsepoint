import { describe, expect, it } from "vitest";
import {
  LEADERSHIP_LOOP_STEPS,
  leadershipLoopStat,
  leadershipLoopTotalMinutes,
  leadershipLoopHref,
} from "@/lib/leadership-loop";

describe("leadership loop", () => {
  const ctx = {
    memberTotal: 50,
    renewalsDue30: 8,
    advocacyActive: 3,
    courseCount: 6,
    revenueMtdUsd: "$12,400",
    exceptionCount: 2,
  };

  it("has seven scripted stops", () => {
    expect(LEADERSHIP_LOOP_STEPS.length).toBe(7);
    expect(leadershipLoopTotalMinutes()).toBe(18);
  });

  it("builds live stat lines from context", () => {
    expect(leadershipLoopStat("membership", ctx)).toContain("50");
    expect(leadershipLoopStat("advocacy", ctx)).toContain("3 active");
    expect(leadershipLoopStat("board-pack", ctx)).toContain("$12,400");
  });

  it("appends walkthrough query for guided mode", () => {
    expect(leadershipLoopHref("demo-healthcare", "/members/analytics")).toBe(
      "/demo-healthcare/members/analytics?walkthrough=1",
    );
  });
});
