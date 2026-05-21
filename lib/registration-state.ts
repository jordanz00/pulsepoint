/**
 * Registration status state machine — invariants ship with the feature.
 */

import type { RegistrationStatus } from "@/app/generated/prisma/client";

const ALLOWED: Record<RegistrationStatus, RegistrationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "WAITLIST"],
  WAITLIST: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

export function canTransitionRegistration(
  from: RegistrationStatus,
  to: RegistrationStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertRegistrationTransition(
  from: RegistrationStatus,
  to: RegistrationStatus,
): void {
  if (!canTransitionRegistration(from, to)) {
    throw new Error(`INVALID_REGISTRATION_TRANSITION:${from}->${to}`);
  }
}
