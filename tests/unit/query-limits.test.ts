import { describe, expect, it } from "vitest";
import { clampTake, QueryTakeCapError, DEFAULT_ADMIN_LIST_CAP } from "@/lib/query-limits";

describe("query-limits", () => {
  it("returns default when requested undefined", () => {
    expect(clampTake(undefined, DEFAULT_ADMIN_LIST_CAP, "test")).toBe(500);
  });

  it("throws when take exceeds max", () => {
    expect(() => clampTake(501, 500, "test")).toThrow(QueryTakeCapError);
  });

  it("allows take within max", () => {
    expect(clampTake(50, 500, "test")).toBe(50);
  });
});
