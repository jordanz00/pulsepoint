/**
 * EventCore correspondence types & labels (client-safe).
 */

export type EventCorrespondenceSegment =
  | "all_registered"
  | "confirmed"
  | "pending"
  | "waitlist"
  | "checked_in"
  | "not_checked_in"
  | "invite_prospects";

export const EVENT_SEGMENT_LABELS: Record<EventCorrespondenceSegment, string> = {
  all_registered: "All registrants (any status)",
  confirmed: "Confirmed attendees",
  pending: "Pending / incomplete",
  waitlist: "Waitlist",
  checked_in: "Checked in",
  not_checked_in: "Registered, not checked in",
  invite_prospects: "Members not yet registered (invite)",
};

export const EVENT_CORRESPONDENCE_SEGMENTS: EventCorrespondenceSegment[] = [
  "all_registered",
  "confirmed",
  "pending",
  "waitlist",
  "checked_in",
  "not_checked_in",
  "invite_prospects",
];
