/**
 * Event publish readiness — honest gate before DRAFT → PUBLISHED.
 */

export type EventPublishCheck = {
  id: string;
  label: string;
  ok: boolean;
};

export type EventPublishReadiness = {
  ready: boolean;
  blockers: string[];
  checks: EventPublishCheck[];
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getEventPublishReadiness(event: {
  title: string;
  startsAt: Date;
  publicSlug: string;
}): EventPublishReadiness {
  const checks: EventPublishCheck[] = [
    {
      id: "title",
      label: "Event title",
      ok: event.title.trim().length >= 2,
    },
    {
      id: "date",
      label: "Start date & time",
      ok: event.startsAt instanceof Date && !Number.isNaN(event.startsAt.getTime()),
    },
    {
      id: "slug",
      label: "Public URL slug",
      ok:
        event.publicSlug.trim().length >= 2 && SLUG_RE.test(event.publicSlug.trim()),
    },
  ];

  const blockers = checks
    .filter((c) => !c.ok)
    .map((c) => `Add ${c.label.toLowerCase()} before publishing.`);

  return {
    ready: blockers.length === 0,
    blockers,
    checks,
  };
}
