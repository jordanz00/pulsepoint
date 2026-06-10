import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportPortalTranscriptCsv } from "@/app/actions/portal-learn";

vi.mock("@/lib/portal/resolve-portal-member", () => ({
  resolvePortalMember: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db", () => ({
  getOrgDb: vi.fn(),
}));

describe("exportPortalTranscriptCsv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when portal member is not linked", async () => {
    const { resolvePortalMember } = await import("@/lib/portal/resolve-portal-member");
    vi.mocked(resolvePortalMember).mockResolvedValue({
      ok: false,
      error: "No membership linked",
    });

    const res = await exportPortalTranscriptCsv("demo-healthcare");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("linked");
  });

  it("exports CSV for linked member enrollments and awards", async () => {
    const { resolvePortalMember } = await import("@/lib/portal/resolve-portal-member");
    vi.mocked(resolvePortalMember).mockResolvedValue({
      ok: true,
      org: { id: "org_1", slug: "demo-healthcare", name: "Demo" },
      member: {
        id: "mem_1",
        firstName: "Jordan",
        lastName: "Member",
        email: "jordan@hospital.org",
      },
      userId: "user_1",
    } as never);

    const { getOrgDb } = await import("@/lib/db");
    vi.mocked(getOrgDb).mockReturnValue({
      courseEnrollment: {
        findMany: vi.fn().mockResolvedValue([
          {
            course: { title: "Leadership CE" },
            status: "COMPLETED",
            enrolledAt: new Date("2026-01-01T12:00:00.000Z"),
            completedAt: new Date("2026-02-01T12:00:00.000Z"),
          },
        ]),
      },
      cECreditAward: {
        findMany: vi.fn().mockResolvedValue([
          {
            creditType: { code: "CME", name: "CME" },
            amount: 1.5,
            source: "course",
            awardedAt: new Date("2026-02-01T12:00:00.000Z"),
            note: "",
          },
        ]),
      },
    } as never);

    const res = await exportPortalTranscriptCsv("demo-healthcare");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data!.enrollmentCount).toBe(1);
      expect(res.data!.awardCount).toBe(1);
      expect(res.data!.csv).toContain("Jordan Member");
      expect(res.data!.csv).toContain("Leadership CE");
      expect(res.data!.csv).toContain("CME");
    }

    const { writeAuditLog } = await import("@/lib/audit");
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "portal.learn.transcript.export",
        entityId: "mem_1",
      }),
    );
  });
});
