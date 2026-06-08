import Link from "next/link";
import { eventStatusLabel } from "@/lib/admin-page-copy";

export type EventListItem = {
  id: string;
  title: string;
  status: string;
  startsAt: Date;
  venueName: string | null;
  format: string;
  registrationCount: number;
  capacity: number | null;
  publicSlug: string;
};

const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: "ec-status-badge--published",
  DRAFT: "ec-status-badge--draft",
  CANCELLED: "ec-status-badge--cancelled",
  COMPLETED: "ec-status-badge--completed",
};

function formatEventDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLabel(format: string): string {
  if (format === "IN_PERSON") return "In person";
  if (format === "VIRTUAL") return "Virtual";
  return "Hybrid";
}

export function EventEventsList({
  orgSlug,
  events,
}: {
  orgSlug: string;
  events: EventListItem[];
}) {
  return (
    <section className="ec-events-list" aria-label="Events directory">
      <div className="ec-events-list-head">
        <p className="ec-events-list-title">Your events</p>
        <p className="ec-events-list-hint">
          Open an event to manage registration, program, correspondence, and day-of operations.
        </p>
      </div>
      <ul className="ec-events-cards">
        {events.map((e) => (
          <li key={e.id}>
            <article className="ec-event-card">
              <div className="ec-event-card-main">
                <div className="ec-event-card-top">
                  <h3 className="ec-event-card-title">
                    <Link href={`/${orgSlug}/events/${e.id}`}>{e.title}</Link>
                  </h3>
                  <span
                    className={`ec-status-badge ${STATUS_CLASS[e.status] ?? "ec-status-badge--draft"}`}
                  >
                    {eventStatusLabel(e.status)}
                  </span>
                </div>
                <p className="ec-event-card-meta">
                  <time dateTime={e.startsAt.toISOString()}>{formatEventDate(e.startsAt)}</time>
                  {e.venueName ? ` · ${e.venueName}` : ""}
                  {" · "}
                  {formatLabel(e.format)}
                </p>
                <div className="ec-event-card-stats">
                  <span>
                    {e.registrationCount}
                    {e.capacity != null ? ` / ${e.capacity}` : ""} registered
                  </span>
                  {e.capacity != null && e.capacity > 0 ? (
                    <div className="ec-event-capacity" aria-label="Registration capacity">
                      <div className="mk-mc-preview-facility-track ec-event-capacity-track">
                        <span
                          className="mk-mc-preview-facility-fill"
                          style={{
                            width: `${Math.min(100, Math.round((e.registrationCount / e.capacity) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="ec-event-capacity-pct">
                        {Math.min(100, Math.round((e.registrationCount / e.capacity) * 100))}% full
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="ec-event-card-actions">
                <Link href={`/${orgSlug}/events/${e.id}`} className="pc-btn-primary text-sm">
                  {e.status === "DRAFT" ? "Finish & publish" : "Manage event"}
                </Link>
                {e.status === "PUBLISHED" ? (
                  <Link
                    href={`/${orgSlug}/e/${e.publicSlug}`}
                    className="pc-btn-secondary text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sign-up page ↗
                  </Link>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
