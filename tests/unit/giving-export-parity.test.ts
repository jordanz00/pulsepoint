import { describe, expect, it } from "vitest";
import { sumRaisedCents } from "@/lib/giving/campaign-stats";
import {
  GIFT_CSV_HEADER,
  buildGiftCsvRow,
  campaignTotalsMatchExport,
  countGiftCsvDataRows,
  giftAmountUsd,
  sumCsvGiftCents,
} from "@/lib/giving/csv-export";

describe("giving export parity", () => {
  it("formats USD from cents", () => {
    expect(giftAmountUsd(2500)).toBe("25.00");
  });

  it("campaign raised total matches paid export rows", () => {
    const donations = [
      { amountCents: 5000, paidAt: new Date() },
      { amountCents: 2500, paidAt: new Date() },
      { amountCents: 1000, paidAt: null },
    ];
    const exportRows = [
      { amountCents: 5000 },
      { amountCents: 2500 },
    ];
    expect(sumRaisedCents(donations)).toBe(7500);
    expect(sumCsvGiftCents(exportRows)).toBe(7500);
    expect(campaignTotalsMatchExport(donations, exportRows)).toBe(true);
  });

  it("CSV row count matches export batch length", () => {
    const gifts = [
      {
        donorName: "Jane Doe",
        donorEmail: "jane@hospital.org",
        amountCents: 10000,
        campaignName: "Annual Fund",
        paidAt: "2026-06-01T12:00:00.000Z",
        createdAt: "2026-06-01T11:00:00.000Z",
        memberId: "mem_1",
      },
      {
        donorName: "PAC, Leadership",
        donorEmail: "",
        amountCents: 5000,
        campaignName: "PAC Drive",
        paidAt: "2026-06-02T12:00:00.000Z",
        createdAt: "2026-06-02T11:00:00.000Z",
        memberId: "",
      },
    ];
    const csv = [GIFT_CSV_HEADER, ...gifts.map(buildGiftCsvRow)].join("\n");
    expect(countGiftCsvDataRows(csv)).toBe(gifts.length);
    expect(sumCsvGiftCents(gifts)).toBe(15000);
    expect(csv).toContain('"PAC, Leadership"');
  });
});
