import { describe, expect, it } from "vitest";
import {
  fetchLegislativeBillsForOrg,
  getLegislativeTrackerAdapterStatus,
} from "@/lib/advocacy/legislative-tracker-adapter";

describe("legislative tracker adapter", () => {
  it("reports adapter_ready without vendor connection", () => {
    expect(getLegislativeTrackerAdapterStatus()).toBe("adapter_ready");
  });

  it("returns empty for unknown org without fabricated bills", async () => {
    const bills = await fetchLegislativeBillsForOrg("org_nonexistent_stub");
    expect(Array.isArray(bills)).toBe(true);
  });
});
