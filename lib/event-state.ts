/**
 * Event status state machine.
 */

import type { EventStatus } from "@/app/generated/prisma/client";

const ALLOWED: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["CANCELLED", "COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

export function canTransitionEvent(from: EventStatus, to: EventStatus): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertEventTransition(from: EventStatus, to: EventStatus): void {
  if (!canTransitionEvent(from, to)) {
    throw new Error(`INVALID_EVENT_TRANSITION:${from}->${to}`);
  }
}
