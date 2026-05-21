import { describe, expect, it } from "vitest";
import { CAPABILITY_MIN_ROLE, roleAllows } from "@/lib/permissions";

describe("permissions", () => {
  it("STAFF cannot export members", () => {
    expect(roleAllows("member:export", "STAFF")).toBe(false);
    expect(roleAllows("member:export", "ADMIN")).toBe(true);
  });

  it("STAFF can write members and notes", () => {
    expect(roleAllows("member:write", "STAFF")).toBe(true);
    expect(roleAllows("member:notes", "STAFF")).toBe(true);
  });

  it("STAFF cannot import or delete members", () => {
    expect(roleAllows("member:import", "STAFF")).toBe(false);
    expect(roleAllows("member:delete", "STAFF")).toBe(false);
    expect(roleAllows("member:import", "ADMIN")).toBe(true);
  });

  it("ADMIN capabilities are gated at ADMIN minimum", () => {
    expect(CAPABILITY_MIN_ROLE["member:export"]).toBe("ADMIN");
    expect(CAPABILITY_MIN_ROLE["member:import"]).toBe("ADMIN");
    expect(CAPABILITY_MIN_ROLE["automation:resolve"]).toBe("ADMIN");
  });

  it("documents minimum roles for every capability", () => {
    const caps = Object.keys(CAPABILITY_MIN_ROLE);
    expect(caps.length).toBeGreaterThan(8);
  });
});
