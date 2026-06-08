import { describe, expect, it } from "vitest";
import {
  committeeInputSchema,
  committeeMeetingInputSchema,
  committeeMemberInputSchema,
  committeeMemberUpdateSchema,
  committeeOfficerRoleSchema,
  committeeUpdateSchema,
} from "@/lib/validations/committee";

describe("committee validation", () => {
  it("accepts valid committee input", () => {
    const parsed = committeeInputSchema.safeParse({
      name: "Finance Committee",
      kind: "STANDING",
      departmentId: "finance_legal",
      description: "Oversees budget and audit.",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unknown department", () => {
    const parsed = committeeInputSchema.safeParse({
      name: "Test",
      kind: "STANDING",
      departmentId: "unknown_dept",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts committee update with id", () => {
    const parsed = committeeUpdateSchema.safeParse({
      id: "cmt_1",
      name: "Renamed committee",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts roster member with officer role", () => {
    const parsed = committeeMemberInputSchema.safeParse({
      memberId: "mem_123",
      officerRole: "CHAIR",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts officer role enum", () => {
    expect(committeeOfficerRoleSchema.safeParse("SECRETARY").success).toBe(true);
    expect(committeeOfficerRoleSchema.safeParse("INVALID").success).toBe(false);
  });

  it("accepts meeting schedule input", () => {
    const parsed = committeeMeetingInputSchema.safeParse({
      title: "Q2 planning",
      startsAt: "2026-06-15T14:00:00",
      location: "Conference room A",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts membership officer update", () => {
    const parsed = committeeMemberUpdateSchema.safeParse({
      membershipId: "cm_1",
      officerRole: "VICE_CHAIR",
    });
    expect(parsed.success).toBe(true);
  });
});
