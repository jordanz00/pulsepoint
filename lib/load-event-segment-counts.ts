import { resolveEventRecipients } from "@/lib/event-recipients";
import {
  EVENT_CORRESPONDENCE_SEGMENTS,
  type EventCorrespondenceSegment,
} from "@/lib/event-correspondence-types";

export async function loadEventSegmentCounts(
  orgId: string,
  eventId: string,
): Promise<Record<EventCorrespondenceSegment, number>> {
  const entries = await Promise.all(
    EVENT_CORRESPONDENCE_SEGMENTS.map(async (s) => {
      const list = await resolveEventRecipients(orgId, eventId, s);
      return [s, list.length] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<EventCorrespondenceSegment, number>;
}
