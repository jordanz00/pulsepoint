import { describe, expect, it } from "vitest";
import { buildMemberListWhere } from "@/lib/member-role-filters";
import {
  memberSearchToQueryString,
  parseMemberSearchFromQuery,
} from "@/lib/validations/member";

describe("parseMemberSearchFromQuery", () => {
  it("treats empty select values as unset so role filter still applies", () => {
    const filters = parseMemberSearchFromQuery({
      q: "",
      status: "",
      rolePreset: "ceo",
      roleMode: "include",
      engagementTier: "",
    });
    expect(filters.rolePreset).toBe("ceo");
    expect(filters.roleMode).toBe("include");
    expect(filters.status).toBeUndefined();
  });

  it("defaults roleMode to include when preset set without mode", () => {
    const filters = parseMemberSearchFromQuery({
      rolePreset: "our_board",
    });
    expect(filters.rolePreset).toBe("our_board");
    expect(filters.roleMode).toBe("include");
  });
});

describe("buildMemberListWhere", () => {
  it("adds role some clause for include mode", () => {
    const where = buildMemberListWhere({
      rolePreset: "c_suite",
      roleMode: "include",
    });
    expect(where.roles).toEqual({
      some: { isCurrent: true, leadershipLevel: "C_SUITE" },
    });
  });

  it("adds role none clause for exclude mode", () => {
    const where = buildMemberListWhere({
      rolePreset: "ceo",
      roleMode: "exclude",
    });
    expect(where.roles).toMatchObject({ none: { isCurrent: true } });
  });
});

describe("memberSearchToQueryString", () => {
  it("builds role query params", () => {
    expect(
      memberSearchToQueryString({ rolePreset: "ceo", roleMode: "include" }),
    ).toBe("?rolePreset=ceo&roleMode=include");
  });
});
