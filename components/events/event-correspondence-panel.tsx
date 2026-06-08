"use client";

import { useState, useTransition } from "react";
import {
  EVENT_CORRESPONDENCE_SEGMENTS,
  EVENT_SEGMENT_LABELS,
  type EventCorrespondenceSegment,
} from "@/lib/event-correspondence-types";
import { EVENT_EMAIL_PRESETS } from "@/lib/event-email-merge";
import { sendEventCorrespondenceToSegment } from "@/app/actions/event-correspondence";

export function EventCorrespondencePanel({
  orgSlug,
  eventId,
  segmentCounts,
  sendLimit,
}: {
  orgSlug: string;
  eventId: string;
  segmentCounts: Record<EventCorrespondenceSegment, number>;
  sendLimit: number;
}) {
  const [segment, setSegment] = useState<EventCorrespondenceSegment>("confirmed");
  const [subject, setSubject] = useState<string>(EVENT_EMAIL_PRESETS[0].subject);
  const [bodyText, setBodyText] = useState<string>(EVENT_EMAIL_PRESETS[0].bodyText);
  const [presetId, setPresetId] = useState<string>(EVENT_EMAIL_PRESETS[0].id);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function applyPreset(id: string) {
    const p = EVENT_EMAIL_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setSubject(p.subject);
    setBodyText(p.bodyText);
  }

  function sendBulk() {
    setMessage(null);
    startTransition(async () => {
      const result = await sendEventCorrespondenceToSegment(orgSlug, {
        eventId,
        segment,
        subject,
        bodyText,
      });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(`Sent ${result.sent} of ${result.attempted} messages.`);
    });
  }

  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-correspondence">
      <h2 className="ec-panel-title">Correspondence</h2>
      <p className="ec-panel-lead">
        Mass email to a registration segment or invite members who have not registered.
        Merge tags:{" "}
        <code className="ec-tag">{"{{firstName}}"}</code>,{" "}
        <code className="ec-tag">{"{{eventTitle}}"}</code>,{" "}
        <code className="ec-tag">{"{{eventDate}}"}</code>,{" "}
        <code className="ec-tag">{"{{registrationLink}}"}</code>. Max {sendLimit}{" "}
        recipients per send.
      </p>

      <div className="ec-form-row">
        <label className="ec-label" htmlFor="ec-preset">
          Preset
        </label>
        <select
          id="ec-preset"
          className="ec-input"
          value={presetId}
          onChange={(e) => applyPreset(e.target.value)}
        >
          {EVENT_EMAIL_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="ec-form-row">
        <label className="ec-label" htmlFor="ec-segment">
          Audience
        </label>
        <select
          id="ec-segment"
          className="ec-input"
          value={segment}
          onChange={(e) => setSegment(e.target.value as EventCorrespondenceSegment)}
        >
          {EVENT_CORRESPONDENCE_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {EVENT_SEGMENT_LABELS[s]} ({segmentCounts[s] ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div className="ec-form-row">
        <label className="ec-label" htmlFor="ec-subject">
          Subject
        </label>
        <input
          id="ec-subject"
          className="ec-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="ec-form-row">
        <label className="ec-label" htmlFor="ec-body">
          Message
        </label>
        <textarea
          id="ec-body"
          className="ec-input ec-textarea"
          rows={8}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="pc-btn-primary"
        disabled={pending || (segmentCounts[segment] ?? 0) === 0}
        onClick={sendBulk}
      >
        {pending ? "Sending…" : `Send to ${segmentCounts[segment] ?? 0} recipients`}
      </button>
      {message ? <p className="ec-feedback">{message}</p> : null}
    </section>
  );
}
