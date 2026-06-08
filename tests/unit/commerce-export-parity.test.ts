import { describe, expect, it } from "vitest";
import {
  countCsvDataRows,
  escapeCommerceCsvCell,
  orderAmountUsd,
  sumOrderTotalCents,
} from "@/lib/commerce/csv-export";

describe("commerce export parity helpers", () => {
  it("formats USD from cents", () => {
    expect(orderAmountUsd(12500)).toBe("125.00");
    expect(orderAmountUsd(0)).toBe("0.00");
  });

  it("sums order totals for parity checks", () => {
    const orders = [{ totalCents: 1000 }, { totalCents: 2500 }, { totalCents: 500 }];
    expect(sumOrderTotalCents(orders)).toBe(4000);
  });

  it("counts CSV data rows excluding header", () => {
    const csv = "order_id,amount\nord-1,10.00\nord-2,20.00";
    expect(countCsvDataRows(csv)).toBe(2);
  });

  it("escapes product titles with commas", () => {
    expect(escapeCommerceCsvCell("Dues, Annual")).toBe('"Dues, Annual"');
  });

  it("export row count matches order list length", () => {
    const orders = [
      { id: "a", totalCents: 100 },
      { id: "b", totalCents: 200 },
      { id: "c", totalCents: 300 },
    ];
    const lines = [
      "order_id,amount_usd",
      ...orders.map((o) => `${o.id},${orderAmountUsd(o.totalCents)}`),
    ];
    expect(countCsvDataRows(lines.join("\n"))).toBe(orders.length);
    expect(sumOrderTotalCents(orders)).toBe(600);
  });
});
