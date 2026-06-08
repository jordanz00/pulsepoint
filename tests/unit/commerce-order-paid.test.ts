import { describe, expect, it, vi, beforeEach } from "vitest";
import { markCommerceOrderPaid } from "@/lib/commerce/mark-order-paid";

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/renewals/apply-dues-payment", () => ({
  applyDuesPaymentForOrder: vi.fn().mockResolvedValue(undefined),
}));

describe("markCommerceOrderPaid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not_found when order is missing", async () => {
    const db = {
      commerceOrder: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    const result = await markCommerceOrderPaid(
      db as never,
      "org_1",
      "ord_missing",
      new Date(),
    );
    expect(result).toEqual({ ok: false, error: "not_found" });
    expect(db.commerceOrder.update).not.toHaveBeenCalled();
  });

  it("returns duplicate when already PAID", async () => {
    const db = {
      commerceOrder: {
        findFirst: vi.fn().mockResolvedValue({
          id: "ord_1",
          orgId: "org_1",
          status: "PAID",
        }),
        update: vi.fn(),
      },
    };
    const result = await markCommerceOrderPaid(
      db as never,
      "org_1",
      "ord_1",
      new Date(),
    );
    expect(result).toEqual({ ok: true, duplicate: true });
    expect(db.commerceOrder.update).not.toHaveBeenCalled();
  });

  it("marks pending order paid and audits", async () => {
    const paidAt = new Date("2026-06-08T12:00:00.000Z");
    const db = {
      commerceOrder: {
        findFirst: vi.fn().mockResolvedValue({
          id: "ord_2",
          orgId: "org_1",
          status: "PENDING",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    const result = await markCommerceOrderPaid(
      db as never,
      "org_1",
      "ord_2",
      paidAt,
      { sessionId: "cs_test_123" },
    );
    expect(result).toEqual({ ok: true, duplicate: false, orderId: "ord_2" });
    expect(db.commerceOrder.update).toHaveBeenCalledWith({
      where: { id: "ord_2" },
      data: { status: "PAID", paidAt },
    });
    const { writeAuditLog } = await import("@/lib/audit");
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: "org_1",
        action: "commerce.order.paid",
        entityId: "ord_2",
        diff: { sessionId: "cs_test_123" },
      }),
    );
    const { applyDuesPaymentForOrder } = await import("@/lib/renewals/apply-dues-payment");
    expect(applyDuesPaymentForOrder).toHaveBeenCalledWith("org_1", "ord_2", paidAt);
  });
});
