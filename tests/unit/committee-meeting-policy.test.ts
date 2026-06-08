import { describe, expect, it } from "vitest";
import {
  countUpcomingMeetings,
  isUpcomingMeeting,
  meetingWindowValid,
} from "@/lib/committees/meeting-policy";

describe("committee meeting policy", () => {
  it("validates end after start", () => {
    const start = new Date("2026-06-10T10:00:00");
    const end = new Date("2026-06-10T11:00:00");
    expect(meetingWindowValid(start, end)).toBe(true);
    expect(meetingWindowValid(start, new Date("2026-06-10T09:00:00"))).toBe(false);
  });

  it("allows open-ended meetings", () => {
    expect(meetingWindowValid(new Date("2026-06-10T10:00:00"), null)).toBe(true);
  });

  it("counts upcoming scheduled meetings", () => {
    const now = new Date("2026-06-01T00:00:00");
    const meetings = [
      { startsAt: new Date("2026-06-15T10:00:00"), status: "SCHEDULED" },
      { startsAt: new Date("2026-05-01T10:00:00"), status: "SCHEDULED" },
      { startsAt: new Date("2026-06-20T10:00:00"), status: "CANCELLED" },
    ];
    expect(countUpcomingMeetings(meetings, now)).toBe(1);
    expect(
      isUpcomingMeeting(new Date("2026-06-15T10:00:00"), "SCHEDULED", now),
    ).toBe(true);
  });
});
