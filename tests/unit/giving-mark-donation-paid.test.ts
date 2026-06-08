import { describe, expect, it, vi } from "vitest";
import { markDonationPaid } from "@/lib/giving/mark-donation-paid";

describe("markDonationPaid", () => {
  it("returns false when donation is missing", async () => {
    const db = {
      donation: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    expect(await markDonationPaid(db as never, "don_missing")).toBe(false);
    expect(db.donation.update).not.toHaveBeenCalled();
  });

  it("returns false when already paid", async () => {
    const db = {
      donation: {
        findFirst: vi.fn().mockResolvedValue({ id: "don_1", paidAt: new Date() }),
        update: vi.fn(),
      },
    };
    expect(await markDonationPaid(db as never, "don_1")).toBe(false);
    expect(db.donation.update).not.toHaveBeenCalled();
  });

  it("marks pending donation paid", async () => {
    const db = {
      donation: {
        findFirst: vi.fn().mockResolvedValue({ id: "don_2", paidAt: null }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    expect(
      await markDonationPaid(db as never, "don_2", {
        adapterId: "stripe",
        paymentIntentId: "pi_123",
      }),
    ).toBe(true);
    expect(db.donation.update).toHaveBeenCalledWith({
      where: { id: "don_2" },
      data: expect.objectContaining({
        paidAt: expect.any(Date),
        providerCheckoutId: "pi_123",
        paymentAdapterId: "stripe",
      }),
    });
  });
});
