import { describe, expect, it } from "vitest";
import {
  countPendingOrders,
  memberCanPayOrder,
} from "@/lib/portal/order-checkout";

describe("portal order checkout", () => {
  it("allows member to pay own pending order", () => {
    expect(
      memberCanPayOrder({ memberId: "mem_1", status: "PENDING" }, "mem_1"),
    ).toBe(true);
  });

  it("blocks paid orders", () => {
    expect(
      memberCanPayOrder({ memberId: "mem_1", status: "PAID" }, "mem_1"),
    ).toBe(false);
  });

  it("blocks another member's order", () => {
    expect(
      memberCanPayOrder({ memberId: "mem_2", status: "PENDING" }, "mem_1"),
    ).toBe(false);
  });

  it("counts pending invoices", () => {
    expect(
      countPendingOrders([
        { status: "PENDING" },
        { status: "PAID" },
        { status: "PENDING" },
      ]),
    ).toBe(2);
  });
});
