/**
 * Whether public registration is open for an event (dates + status).
 */

export type RegistrationWindowResult =
  | { open: true }
  | { open: false; reason: "not_published" | "not_open_yet" | "closed" | "cancelled" | "completed" };

export function checkRegistrationWindow(
  event: {
    status: string;
    registrationOpensAt: Date | null;
    registrationClosesAt: Date | null;
  },
  now: Date = new Date(),
): RegistrationWindowResult {
  if (event.status === "CANCELLED") return { open: false, reason: "cancelled" };
  if (event.status === "COMPLETED") return { open: false, reason: "completed" };
  if (event.status !== "PUBLISHED") return { open: false, reason: "not_published" };
  if (event.registrationOpensAt && now < event.registrationOpensAt) {
    return { open: false, reason: "not_open_yet" };
  }
  if (event.registrationClosesAt && now > event.registrationClosesAt) {
    return { open: false, reason: "closed" };
  }
  return { open: true };
}
