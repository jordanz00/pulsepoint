/**
 * Member detail one-screen summary — slice helpers for regs and notes.
 */

export const ONE_SCREEN_RECENT_REGS_MAX = 5;
export const ONE_SCREEN_RECENT_NOTES_MAX = 3;

export function countActiveRegistrations(registrations: { status: string }[]): number {
  return registrations.filter((r) => r.status !== "CANCELLED").length;
}

export function recentRegistrations<T>(registrations: T[]): T[] {
  return registrations.slice(0, ONE_SCREEN_RECENT_REGS_MAX);
}
