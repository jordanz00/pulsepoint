import { describe, expect, it } from "vitest";
import {
  TenantLeakError,
  assertAllRowsBelongToOrg,
  capMemberListRows,
  MAX_MEMBER_LIST_ROWS,
} from "@/lib/tenant-guards";

describe("tenant-guards", () => {
  it("passes when every row matches orgId", () => {
    expect(() =>
      assertAllRowsBelongToOrg(
        [
          { orgId: "org_a", id: "1" },
          { orgId: "org_a", id: "2" },
        ],
        "org_a",
        "test",
      ),
    ).not.toThrow();
  });

  it("throws TENANT_LEAK when a row belongs to another org", () => {
    expect(() =>
      assertAllRowsBelongToOrg(
        [{ orgId: "org_b", id: "stolen" }],
        "org_a",
        "export",
      ),
    ).toThrow(TenantLeakError);
  });

  it("caps list size", () => {
    const rows = Array.from({ length: MAX_MEMBER_LIST_ROWS + 1 }, (_, i) => ({
      id: String(i),
    }));
    expect(() => capMemberListRows(rows, "list")).toThrow(/MEMBER_LIST_CAP/);
  });
});
