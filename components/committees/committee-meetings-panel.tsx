"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  cancelCommitteeMeeting,
  scheduleCommitteeMeeting,
  updateCommitteeMeeting,
} from "@/app/actions/committees";
import { isUpcomingMeeting } from "@/lib/committees/meeting-policy";

type MeetingRow = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string;
  virtualUrl: string;
  agenda: string;
  status: string;
};

export function CommitteeMeetingsPanel({
  orgSlug,
  committeeId,
  meetings,
  canWrite,
}: {
  orgSlug: string;
  committeeId: string;
  meetings: MeetingRow[];
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const upcoming = meetings.filter((m) => isUpcomingMeeting(m.startsAt, m.status));
  const past = meetings.filter((m) => !isUpcomingMeeting(m.startsAt, m.status));

  return (
    <section className="ds-card ds-glass committee-section">
      <h2 className="committee-section__title">Meeting schedule</h2>
      {msg ? <p className="ds-page-subtitle">{msg}</p> : null}

      {upcoming.length === 0 ? (
        <p className="pp-empty-copy">No upcoming meetings scheduled.</p>
      ) : (
        <ul className="committee-meetings-list">
          {upcoming.map((m) => (
            <li key={m.id} className="committee-meetings-list__item">
              <div>
                <p className="committee-meetings-list__when">
                  {format(m.startsAt, "EEE, MMM d, yyyy · h:mm a")}
                  {m.endsAt ? ` – ${format(m.endsAt, "h:mm a")}` : ""}
                </p>
                <p className="committee-meetings-list__title">
                  {m.title || "Committee meeting"}
                </p>
                {m.location ? (
                  <p className="committee-meetings-list__meta">{m.location}</p>
                ) : null}
                {m.virtualUrl ? (
                  <a
                    href={m.virtualUrl}
                    className="committee-meetings-list__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join virtual
                  </a>
                ) : null}
              </div>
              {canWrite ? (
                <div className="committee-meetings-list__actions">
                  <button
                    type="button"
                    className="ds-btn ds-btn--ghost"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await updateCommitteeMeeting(orgSlug, committeeId, {
                          meetingId: m.id,
                          status: "COMPLETED",
                        });
                        setMsg(res.ok ? "Meeting marked complete." : res.error);
                      });
                    }}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    className="ds-btn ds-btn--ghost"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await cancelCommitteeMeeting(
                          orgSlug,
                          committeeId,
                          m.id,
                        );
                        setMsg(res.ok ? "Meeting cancelled." : res.error);
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 ? (
        <>
          <h3 className="committee-section__subtitle">Past & cancelled</h3>
          <ul className="committee-meetings-list committee-meetings-list--muted">
            {past.slice(0, 8).map((m) => (
              <li key={m.id} className="committee-meetings-list__item">
                <p className="committee-meetings-list__when">
                  {format(m.startsAt, "MMM d, yyyy")} · {m.status.toLowerCase()}
                </p>
                <p className="committee-meetings-list__title">
                  {m.title || "Committee meeting"}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {canWrite ? (
        <form
          className="committee-meeting-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await scheduleCommitteeMeeting(orgSlug, committeeId, {
                title: String(fd.get("title") ?? ""),
                startsAt: String(fd.get("startsAt") ?? ""),
                endsAt: String(fd.get("endsAt") ?? "") || undefined,
                location: String(fd.get("location") ?? ""),
                virtualUrl: String(fd.get("virtualUrl") ?? ""),
                agenda: String(fd.get("agenda") ?? ""),
              });
              setMsg(res.ok ? "Meeting scheduled." : res.error);
              if (res.ok) e.currentTarget.reset();
            });
          }}
        >
          <h3 className="committee-section__subtitle">Schedule meeting</h3>
          <div className="committee-form-grid">
            <input name="title" placeholder="Meeting title" className="pc-input" maxLength={120} />
            <input
              name="startsAt"
              type="datetime-local"
              required
              className="pc-input"
            />
            <input name="endsAt" type="datetime-local" className="pc-input" />
            <input name="location" placeholder="Location" className="pc-input" maxLength={200} />
            <input
              name="virtualUrl"
              type="url"
              placeholder="Virtual link (optional)"
              className="pc-input"
            />
            <textarea
              name="agenda"
              placeholder="Agenda (optional)"
              className="pc-textarea"
              rows={3}
              maxLength={2000}
            />
          </div>
          <button type="submit" className="ds-btn ds-btn--secondary" disabled={pending}>
            Add to schedule
          </button>
        </form>
      ) : null}
    </section>
  );
}
