import { describe, expect, it } from "vitest";
import {
  evaluateEmailLink,
  normalizeMemberEmail,
} from "@/lib/portal/link-portal-member";

describe("portal member link", () => {
  it("normalizes email for matching", () => {
    expect(normalizeMemberEmail("  Jane@Hospital.org ")).toBe("jane@hospital.org");
  });

  it("links when exactly one email match", () => {
    const result = evaluateEmailLink(
      [
        { id: "m1", clerkUserId: null, email: "jane@hospital.org" },
        { id: "m2", clerkUserId: null, email: "bob@hospital.org" },
      ],
      "user_abc",
      "Jane@Hospital.org",
    );
    expect(result).toEqual({ ok: true, memberId: "m1" });
  });

  it("rejects ambiguous email matches", () => {
    const result = evaluateEmailLink(
      [
        { id: "m1", clerkUserId: null, email: "jane@hospital.org" },
        { id: "m2", clerkUserId: null, email: "jane@hospital.org" },
      ],
      "user_abc",
      "jane@hospital.org",
    );
    expect(result).toEqual({ ok: false, reason: "ambiguous" });
  });

  it("rejects when member already linked to another user", () => {
    const result = evaluateEmailLink(
      [{ id: "m1", clerkUserId: "user_other", email: "jane@hospital.org" }],
      "user_abc",
      "jane@hospital.org",
    );
    expect(result).toEqual({ ok: false, reason: "already_linked" });
  });

  it("allows re-link to same clerk user", () => {
    const result = evaluateEmailLink(
      [{ id: "m1", clerkUserId: "user_abc", email: "jane@hospital.org" }],
      "user_abc",
      "jane@hospital.org",
    );
    expect(result).toEqual({ ok: true, memberId: "m1" });
  });
});
