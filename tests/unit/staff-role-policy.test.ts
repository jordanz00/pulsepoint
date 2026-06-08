import { describe, expect, it } from "vitest";
import { assignableRoles, canAssignRole } from "@/lib/staff/role-policy";

describe("staff role policy", () => {
  it("OWNER can assign all roles", () => {
    expect(assignableRoles("OWNER")).toEqual(["STAFF", "ADMIN", "OWNER"]);
  });

  it("ADMIN can assign staff and admin only", () => {
    expect(assignableRoles("ADMIN")).toEqual(["STAFF", "ADMIN"]);
  });

  it("blocks demoting the last owner", () => {
    const result = canAssignRole("OWNER", "OWNER", "ADMIN", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/at least one owner/i);
  });

  it("ADMIN cannot change OWNER membership", () => {
    const result = canAssignRole("ADMIN", "OWNER", "ADMIN", 2);
    expect(result.ok).toBe(false);
  });

  it("ADMIN cannot grant OWNER", () => {
    const result = canAssignRole("ADMIN", "STAFF", "OWNER", 1);
    expect(result.ok).toBe(false);
  });

  it("allows OWNER to promote staff to admin when multiple owners exist", () => {
    const result = canAssignRole("OWNER", "STAFF", "ADMIN", 2);
    expect(result.ok).toBe(true);
  });
});
