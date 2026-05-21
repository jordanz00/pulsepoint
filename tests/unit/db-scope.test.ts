import { describe, expect, it } from "vitest";
import { mergeCreateData, mergeWhere } from "@/lib/db-scope";

describe("tenant db scope", () => {
  it("merges orgId into where", () => {
    const out = mergeWhere({ where: { id: "m1" } }, "org_a");
    expect(out.where).toEqual({ id: "m1", orgId: "org_a" });
  });

  it("merges orgId into create data", () => {
    const out = mergeCreateData(
      { data: { firstName: "Ada" } },
      "org_b",
    );
    expect(out.data).toEqual({ firstName: "Ada", orgId: "org_b" });
  });

  it("prevents cross-org read when id is guessed", () => {
    const scoped = mergeWhere(
      { where: { id: "member-from-other-org" } },
      "org_home",
    );
    expect(scoped.where).toMatchObject({
      id: "member-from-other-org",
      orgId: "org_home",
    });
  });
});
