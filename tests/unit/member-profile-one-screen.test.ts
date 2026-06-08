import { describe, expect, it } from "vitest";
import {
  ONE_SCREEN_RECENT_REGS_MAX,
  countActiveRegistrations,
  recentRegistrations,
} from "@/lib/member-profile/one-screen";

describe("member profile one-screen helpers", () => {
  it("counts non-cancelled registrations", () => {
    const n = countActiveRegistrations([
      { status: "CONFIRMED" },
      { status: "CANCELLED" },
      { status: "WAITLIST" },
    ]);
    expect(n).toBe(2);
  });

  it(`slices registrations to ${ONE_SCREEN_RECENT_REGS_MAX}`, () => {
    const regs = Array.from({ length: 12 }, (_, i) => ({ id: i }));
    expect(recentRegistrations(regs)).toHaveLength(ONE_SCREEN_RECENT_REGS_MAX);
  });
});
