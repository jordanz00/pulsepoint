"use client";

import { useState, useTransition } from "react";
import { sendEventCorrespondenceToOne } from "@/app/actions/event-correspondence";

export function EventAttendeeEmailButton({
  orgSlug,
  eventId,
  registrationId,
  email,
  displayName,
}: {
  orgSlug: string;
  eventId: string;
  registrationId: string;
  email: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Regarding your registration");
  const [bodyText, setBodyText] = useState(
    "Hi {{firstName}},\n\nWe wanted to follow up about your registration.\n\n{{registrationLink}}",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        className="pc-btn-secondary text-xs"
        onClick={() => setOpen(true)}
      >
        Email
      </button>
    );
  }

  return (
    <div className="ec-inline-compose">
      <input
        className="ec-input text-sm"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />
      <textarea
        className="ec-input ec-textarea text-sm"
        rows={3}
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="pc-btn-primary text-xs"
          disabled={pending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const result = await sendEventCorrespondenceToOne(orgSlug, {
                eventId,
                registrationId,
                email,
                displayName,
                subject,
                bodyText,
              });
              if (!result.ok) {
                setMessage(result.error);
                return;
              }
              setMessage(result.status === "sent" ? "Sent." : `Status: ${result.status}`);
              if (result.status === "sent") setOpen(false);
            });
          }}
        >
          Send
        </button>
        <button type="button" className="pc-btn-secondary text-xs" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      {message ? <p className="ec-feedback text-xs">{message}</p> : null}
    </div>
  );
}
