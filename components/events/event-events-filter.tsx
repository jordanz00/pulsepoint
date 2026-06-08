"use client";

import { useMemo, useState } from "react";
import { EventEventsList, type EventListItem } from "@/components/events/event-events-list";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function EventEventsFilter({
  orgSlug,
  events,
}: {
  orgSlug: string;
  events: EventListItem[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (status !== "ALL" && e.status !== status) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        (e.venueName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [events, query, status]);

  return (
    <>
      <div className="ec-events-toolbar glass" role="search">
        <div className="ec-events-toolbar-field">
          <label className="ec-events-toolbar-label" htmlFor="ec-event-search">
            Search events
          </label>
          <input
            id="ec-event-search"
            type="search"
            className="ec-input"
            placeholder="Title or venue…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="ec-events-toolbar-field" style={{ flex: "0 1 11rem" }}>
          <label className="ec-events-toolbar-label" htmlFor="ec-event-status">
            Status
          </label>
          <select
            id="ec-event-status"
            className="ec-input ec-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className="ec-events-list-hint w-full" style={{ margin: 0 }}>
          {filtered.length} of {events.length} events
        </p>
      </div>
      {filtered.length === 0 ? (
        <p className="ec-events-list-hint">No events match your filters.</p>
      ) : (
        <EventEventsList orgSlug={orgSlug} events={filtered} />
      )}
    </>
  );
}
