/**
 * Commerce finance CSV helpers — pure functions for export parity tests.
 */

export function escapeCommerceCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function orderAmountUsd(totalCents: number): string {
  return (totalCents / 100).toFixed(2);
}

export function sumOrderTotalCents(orders: { totalCents: number }[]): number {
  return orders.reduce((sum, o) => sum + o.totalCents, 0);
}

/** Data rows only (excludes header). */
export function countCsvDataRows(csv: string): number {
  const lines = csv.trim().split("\n");
  return Math.max(0, lines.length - 1);
}
