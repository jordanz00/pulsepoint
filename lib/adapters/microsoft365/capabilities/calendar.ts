import { graphGet } from "@/lib/adapters/microsoft365/graph-fetch";
import type { GraphCalendarEvent } from "@/lib/adapters/microsoft365/types";

type EventsResponse = {
  value?: Array<{
    id: string;
    subject?: string;
    start?: { dateTime?: string };
    end?: { dateTime?: string };
    location?: { displayName?: string };
    isOnlineMeeting?: boolean;
  }>;
};

export async function fetchCalendarEvents(
  accessToken: string,
  limit = 10,
): Promise<GraphCalendarEvent[]> {
  const data = await graphGet<EventsResponse>(
    accessToken,
    `/me/calendar/events?$top=${limit}&$orderby=start/dateTime desc&$select=id,subject,start,end,location,isOnlineMeeting`,
  );

  return (data.value ?? []).map((e) => ({
    id: e.id,
    subject: e.subject ?? "(No title)",
    start: e.start?.dateTime ?? "",
    end: e.end?.dateTime ?? "",
    location: e.location?.displayName ?? "",
    isOnline: Boolean(e.isOnlineMeeting),
  }));
}
