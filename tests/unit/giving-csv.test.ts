import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "@/lib/giving/csv";

describe("giving CSV export", () => {
  it("passes through simple values", () => {
    expect(escapeCsvCell("Jane Doe")).toBe("Jane Doe");
  });

  it("quotes values with commas", () => {
    expect(escapeCsvCell('PAC, Annual')).toBe('"PAC, Annual"');
  });

  it("escapes embedded quotes", () => {
    expect(escapeCsvCell('Say "thanks"')).toBe('"Say ""thanks"""');
  });
});
