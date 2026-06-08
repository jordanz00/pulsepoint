"use client";

import { useState, useTransition } from "react";
import { upsertEventSurvey } from "@/app/actions/event-advanced";
import { DEFAULT_SURVEY_QUESTIONS } from "@/lib/event-survey-types";

export function EventSurveyPanel({
  orgSlug,
  eventId,
  survey,
}: {
  orgSlug: string;
  eventId: string;
  survey: {
    title: string;
    active: boolean;
    responseCount: number;
    opensAt: string | null;
    closesAt: string | null;
  } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-survey">
      <h2 className="ec-panel-title">Post-event survey</h2>
      <p className="ec-panel-lead">
        Collect feedback after the event. Share the survey link with checked-in attendees.
        {survey ? ` ${survey.responseCount} response(s).` : ""}
      </p>
      <form
        className="grid gap-3 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await upsertEventSurvey(orgSlug, eventId, {
              title: String(fd.get("title") ?? "Post-event feedback"),
              active: fd.get("active") === "on",
              questions: DEFAULT_SURVEY_QUESTIONS,
              opensAt: String(fd.get("opensAt") ?? "") || undefined,
              closesAt: String(fd.get("closesAt") ?? "") || undefined,
            });
            setMsg(res.ok ? "Survey saved." : res.error);
          });
        }}
      >
        <input name="title" className="ec-input" defaultValue={survey?.title ?? "Post-event feedback"} placeholder="Survey title" />
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={survey?.active ?? false} />
          Survey open for responses
        </label>
        <button type="submit" className="pc-btn-primary" disabled={pending}>
          Save survey
        </button>
      </form>
      {survey?.active ? (
        <p className="mt-4 text-sm">
          Public link:{" "}
          <code className="ec-tag">
            /api/public/event-survey?org={orgSlug}&amp;event={eventId}
          </code>{" "}
          (use post-event email with merge link to microsite + survey CTA)
        </p>
      ) : null}
      {msg ? <p className="ec-feedback">{msg}</p> : null}
    </section>
  );
}
