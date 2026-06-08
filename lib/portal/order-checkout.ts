/**
 * Portal invoice checkout guards — member can only pay their own pending orders.
 */

export type PayableOrder = {
  memberId: string | null;
  status: string;
};

export function memberCanPayOrder(order: PayableOrder, memberId: string): boolean {
  return order.status === "PENDING" && order.memberId === memberId;
}

export function countPendingOrders(
  orders: Array<{ status: string }>,
): number {
  return orders.filter((o) => o.status === "PENDING").length;
}
