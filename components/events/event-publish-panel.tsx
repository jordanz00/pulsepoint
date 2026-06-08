"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishEvent } from "@/app/actions/events";
import { CopyRegistrationLink } from "@/components/events/copy-registration-link";
import type { EventPublishReadiness } from "@/lib/events/publish-readiness";

export function EventPublishPanel({
  orgSlug,
  eventId,
  status,
  registrationUrl,
  registrationPath,
  readiness,
}: {
  orgSlug: string;
  eventId: string;
  status: string;
  registrationUrl: string;
  registrationPath: string;
  readiness: EventPublishReadiness;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(status === "PUBLISHED");

  if (published) {
    return (
      <section className="ec-publish-panel ec-publish-panel--live" aria-label="Event published">
        <h3 className="ec-publish-panel-title">Registration is live</h3>
        <p className="ec-publish-panel-lead">
          Share this link in email, on your website, or in member communications.
        </p>
        <div className="ec-publish-panel-url">
          <code className="ec-publish-panel-url-text">{registrationUrl}</code>
        </div>
        <div className="ec-action-row">
          <CopyRegistrationLink registrationUrl={registrationUrl} />
          <Link
            href={registrationPath}
            className="pc-btn-primary text-sm min-h-11"
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview sign-up page ↗
          </Link>
        </div>
      </section>
    );
  }

  if (status !== "DRAFT") return null;

  return (
    <section className="ec-publish-panel" aria-label="Publish event">
      <h3 className="ec-publish-panel-title">Ready to publish?</h3>
      <p className="ec-publish-panel-lead">
        Publishing opens the public registration page. Draft events stay staff-only until you publish.
      </p>
      <ul className="ec-publish-checklist">
        {readiness.checks.map((c) => (
          <li
            key={c.id}
            className={`ec-publish-check${c.ok ? " ec-publish-check--ok" : " ec-publish-check--pending"}`}
          >
            <span className="ec-publish-check-icon" aria-hidden>
              {c.ok ? "✓" : "○"}
            </span>
            {c.label}
          </li>
        ))}
      </ul>
      {error ? (
        <p className="ec-feedback ec-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="ec-action-row">
        <button
          type="button"
          className="pc-btn-primary min-h-11"
          disabled={pending || !readiness.ready}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await publishEvent(eventId, orgSlug);
              if (!res.ok) {
                setError(res.error ?? "Could not publish event");
                return;
              }
              setPublished(true);
              router.refresh();
            });
          }}
        >
          {pending ? "Publishing…" : "Publish event"}
        </button>
        <Link
          href={`/${orgSlug}/events/${eventId}?tab=settings`}
          className="pc-btn-secondary text-sm min-h-11"
        >
          Edit settings
        </Link>
      </div>
      {!readiness.ready ? (
        <p className="ec-publish-hint">Complete the checklist in Settings, then return here to publish.</p>
      ) : null}
    </section>
  );
}
