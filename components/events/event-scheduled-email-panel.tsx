"use client";

import { useState, useTransition } from "react";
import {
  createEventScheduledEmail,
  cancelEventScheduledEmail,
} from "@/app/actions/event-advanced";
import {
  EVENT_CORRESPONDENCE_SEGMENTS,
  EVENT_SEGMENT_LABELS,
  type EventCorrespondenceSegment,
} from "@/lib/event-correspondence-types";
import { EVENT_EMAIL_PRESETS } from "@/lib/event-email-merge";

export type ScheduledEmailRow = {
  id: string;
  name: string;
  segment: string;
  subject: string;
  sendAt: string;
  status: string;
};

export function EventScheduledEmailPanel({
  orgSlug,
  eventId,
  rows,
}: {
  orgSlug: string;
  eventId: string;
  rows: ScheduledEmailRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const preset = EVENT_EMAIL_PRESETS[0];

  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-schedule">
      <h2 className="ec-panel-title">Scheduled email</h2>
      <p className="ec-panel-lead">
        Queue save-the-date, reminders, or thank-you emails. Platform cron sends when due (every
        few minutes via /api/cron/platform).
      </p>
      <form
        className="grid gap-3 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await createEventScheduledEmail(orgSlug, eventId, {
              name: String(fd.get("name")),
              segment: String(fd.get("segment")),
              subject: String(fd.get("subject")),
              bodyText: String(fd.get("bodyText")),
              sendAt: String(fd.get("sendAt")),
            });
            setMsg(res.ok ? "Scheduled." : res.error);
            if (res.ok) e.currentTarget.reset();
          });
        }}
      >
        <input name="name" className="ec-input" placeholder="Campaign name" required />
        <select name="segment" className="ec-input" defaultValue="confirmed">
          {EVENT_CORRESPONDENCE_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {EVENT_SEGMENT_LABELS[s as EventCorrespondenceSegment]}
            </option>
          ))}
        </select>
        <input name="subject" className="ec-input" defaultValue={preset.subject} required />
        <textarea name="bodyText" className="ec-input ec-textarea" rows={4} defaultValue={preset.bodyText} required />
        <input name="sendAt" type="datetime-local" className="ec-input" required />
        <button type="submit" className="pc-btn-primary" disabled={pending}>
          Schedule send
        </button>
      </form>
      {msg ? <p className="ec-feedback">{msg}</p> : null}
      {rows.length > 0 ? (
        <ul className="mt-6 divide-y rounded-lg border">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-[var(--readable-on-light-muted)]">
                  {r.segment} · {new Date(r.sendAt).toLocaleString()} · {r.status}
                </p>
              </div>
              {r.status === "SCHEDULED" ? (
                <button
                  type="button"
                  className="pc-btn-secondary text-xs"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await cancelEventScheduledEmail(orgSlug, r.id, eventId);
                    })
                  }
                >
                  Cancel
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
