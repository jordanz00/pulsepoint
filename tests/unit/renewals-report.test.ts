import { describe, expect, it } from "vitest";
import {
  buildRenewalsDueCsv,
  summarizeRenewals,
} from "@/lib/renewals/renewals-report";

describe("renewals report", () => {
  it("summarizes overdue vs due soon", () => {
    const now = new Date("2026-06-08T12:00:00.000Z");
    const summary = summarizeRenewals(
      [
        {
          id: "a",
          firstName: "Ann",
          lastName: "Lee",
          email: "a@x.org",
          renewalDueAt: new Date("2026-06-01"),
          tierName: "Full",
        },
        {
          id: "b",
          firstName: "Bob",
          lastName: "Kay",
          email: "b@x.org",
          renewalDueAt: new Date("2026-06-20"),
          tierName: "Full",
        },
        {
          id: "c",
          firstName: "Cal",
          lastName: "May",
          email: "c@x.org",
          renewalDueAt: new Date("2026-08-01"),
          tierName: "Associate",
        },
      ],
      now,
    );
    expect(summary.total).toBe(3);
    expect(summary.overdue).toBe(1);
    expect(summary.dueSoon).toBe(2);
  });

  it("builds CSV with status column", () => {
    const csv = buildRenewalsDueCsv([
      {
        id: "mem_1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@hospital.org",
        renewalDueAt: new Date("2026-06-01T00:00:00.000Z"),
        tierName: "Hospital Member",
      },
    ]);
    expect(csv).toContain("member_id,name,email");
    expect(csv).toContain("Jane Doe");
    expect(csv.split("\n").length).toBe(2);
  });
});
