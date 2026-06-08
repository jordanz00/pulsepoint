import { describe, expect, it } from "vitest";
import { buildMemberTranscriptCsv } from "@/lib/learn/transcript-csv";

describe("learn transcript CSV", () => {
  it("includes enrollments and awards", () => {
    const csv = buildMemberTranscriptCsv({
      memberName: "Jane Doe",
      memberEmail: "jane@hospital.org",
      enrollments: [
        {
          courseTitle: "340B Compliance Basics",
          status: "ENROLLED",
          enrolledAt: "2026-01-15T12:00:00.000Z",
          completedAt: "",
        },
      ],
      awards: [
        {
          creditCode: "CME",
          creditName: "Continuing Medical Education",
          amount: 2,
          source: "manual",
          awardedAt: "2026-02-01T12:00:00.000Z",
          note: "Board session",
        },
      ],
    });
    expect(csv).toContain("Jane Doe");
    expect(csv).toContain("340B Compliance Basics");
    expect(csv).toContain("CME");
    expect(csv).toContain("enrollment");
    expect(csv).toContain("award");
  });
});
