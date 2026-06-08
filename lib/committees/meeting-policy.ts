/**
 * Committee meeting schedule guards.
 */

export function meetingWindowValid(startsAt: Date, endsAt: Date | null): boolean {
  if (!endsAt) return true;
  return endsAt.getTime() > startsAt.getTime();
}

export function isUpcomingMeeting(
  startsAt: Date,
  status: string,
  now = new Date(),
): boolean {
  return status === "SCHEDULED" && startsAt.getTime() >= now.getTime();
}

export function countUpcomingMeetings(
  meetings: Array<{ startsAt: Date; status: string }>,
  now = new Date(),
): number {
  return meetings.filter((m) => isUpcomingMeeting(m.startsAt, m.status, now)).length;
}
