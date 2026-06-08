import { describe, expect, it } from "vitest";
import {
  campaignInputSchema,
  dollarsToCents,
  publicDonationInputSchema,
  staffDonationInputSchema,
} from "@/lib/validations/giving";

describe("giving validation", () => {
  it("accepts campaign with goal in dollars", () => {
    const parsed = campaignInputSchema.safeParse({
      name: "Hospital PAC",
      goalDollars: 50000,
      status: "ACTIVE",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts public donation", () => {
    const parsed = publicDonationInputSchema.safeParse({
      campaignId: "camp_abc123",
      donorName: "Jane Doe",
      donorEmail: "jane@hospital.org",
      amountDollars: 250,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects gift under one dollar", () => {
    const parsed = staffDonationInputSchema.safeParse({
      campaignId: "camp_abc",
      donorName: "Test",
      amountDollars: 0.5,
    });
    expect(parsed.success).toBe(false);
  });

  it("converts dollars to cents", () => {
    expect(dollarsToCents(99.99)).toBe(9999);
  });
});
