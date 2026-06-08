"use client";

import { useTransition } from "react";
import { toggleSessionRsvp } from "@/app/actions/event-advanced";

export type SessionRsvpRow = {
  sessionId: string;
  title: string;
  when: string;
  room: string;
  enrolled: number;
  capacityLabel: string;
};

export function EventSessionRsvpPanel({
  orgSlug,
  eventId,
  sessions,
  registrations,
  enrollments,
}: {
  orgSlug: string;
  eventId: string;
  sessions: SessionRsvpRow[];
  registrations: { id: string; label: string }[];
  enrollments: Record<string, string[]>;
}) {
  const [pending, startTransition] = useTransition();

  if (sessions.length === 0) {
    return (
      <section className="ec-panel glass pp-readable-on-light pp-motion-card">
        <h2 className="ec-panel-title">Session RSVP</h2>
        <p className="ec-panel-lead">Add sessions under Program first, then assign attendees to breakouts.</p>
      </section>
    );
  }

  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-sessions">
      <h2 className="ec-panel-title">Session RSVP</h2>
      <p className="ec-panel-lead">
        Per-session enrollment for breakouts and CE tracks. Members can also RSVP on the public
        event page when logged in.
      </p>
      <ul className="space-y-6">
        {sessions.map((s) => (
          <li key={s.sessionId} className="rounded-xl border border-[var(--readable-on-light-border)] p-4 bg-white/70">
            <p className="font-semibold">{s.title}</p>
            <p className="text-sm text-[var(--readable-on-light-muted)]">
              {s.when} · {s.room || "Room TBD"} · {s.enrolled} enrolled
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {registrations.slice(0, 12).map((r) => {
                const on = enrollments[s.sessionId]?.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={pending}
                    className={`text-xs px-2 py-1 rounded-full border ${on ? "bg-[var(--topic-events-tint)] border-[var(--topic-events-border)]" : "border-slate-200"}`}
                    onClick={() =>
                      startTransition(async () => {
                        await toggleSessionRsvp(orgSlug, s.sessionId, r.id, !on);
                      })
                    }
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
