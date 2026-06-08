import { describe, expect, it } from "vitest";
import { computeNextRenewalDate } from "@/lib/renewals/compute-next-renewal";

describe("computeNextRenewalDate", () => {
  it("extends annual membership by one year from payment when overdue", () => {
    const paidAt = new Date("2026-03-01T12:00:00Z");
    const currentDue = new Date("2026-01-15T12:00:00Z");
    const next = computeNextRenewalDate(currentDue, "ANNUAL", paidAt);
    expect(next.getUTCFullYear()).toBe(2027);
    expect(next.getUTCMonth()).toBe(2);
  });

  it("extends from future due date when member pays early", () => {
    const paidAt = new Date("2026-03-01T12:00:00Z");
    const currentDue = new Date("2026-09-01T12:00:00Z");
    const next = computeNextRenewalDate(currentDue, "ANNUAL", paidAt);
    expect(next.getUTCFullYear()).toBe(2027);
    expect(next.getUTCMonth()).toBe(8);
  });

  it("extends monthly membership by one month", () => {
    const paidAt = new Date("2026-03-15T12:00:00Z");
    const next = computeNextRenewalDate(null, "MONTHLY", paidAt);
    expect(next.getUTCMonth()).toBe(3);
    expect(next.getUTCDate()).toBe(15);
  });

  it("handles first-time member with no prior due date", () => {
    const paidAt = new Date("2026-06-01T12:00:00Z");
    const next = computeNextRenewalDate(null, "ANNUAL", paidAt);
    expect(next.getUTCFullYear()).toBe(2027);
    expect(next.getUTCMonth()).toBe(5);
  });
});
