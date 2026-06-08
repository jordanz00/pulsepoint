import Link from "next/link";
import type { EventAnalytics } from "@/lib/event-analytics";
import { formatUsd } from "@/lib/event-analytics";
import { EventExportButton } from "@/components/events/event-export-button";
import { EventPublishPanel } from "@/components/events/event-publish-panel";
import { CopyRegistrationLink } from "@/components/events/copy-registration-link";
import type { EventPublishReadiness } from "@/lib/events/publish-readiness";

export function EventOverviewPanel({
  orgSlug,
  eventId,
  eventTitle,
  statusLabel,
  format,
  venueName,
  registrationUrl,
  registrationPath,
  status,
  publishReadiness,
  showPublishedBanner,
  analytics,
}: {
  orgSlug: string;
  eventId: string;
  eventTitle: string;
  statusLabel: string;
  format: string;
  venueName: string;
  registrationUrl: string;
  registrationPath: string;
  status: string;
  publishReadiness: EventPublishReadiness;
  showPublishedBanner?: boolean;
  analytics: EventAnalytics;
}) {
  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-overview">
      {showPublishedBanner ? (
        <p className="ec-publish-banner" role="status">
          Event published. Copy the registration link below and share with members.
        </p>
      ) : null}

      <EventPublishPanel
        orgSlug={orgSlug}
        eventId={eventId}
        status={status}
        registrationUrl={registrationUrl}
        registrationPath={registrationPath}
        readiness={publishReadiness}
      />

      <h2 className="ec-panel-title">Overview</h2>
      <p className="ec-panel-lead">
        {statusLabel} · {format === "IN_PERSON" ? "In person" : format === "VIRTUAL" ? "Virtual" : "Hybrid"}
        {venueName ? ` · ${venueName}` : ""}
      </p>

      <div className="ec-analytics-grid">
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.totalRegistrations}</span>
          <span className="ec-analytics-label">Total registrations</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.confirmed}</span>
          <span className="ec-analytics-label">Confirmed</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.waitlist}</span>
          <span className="ec-analytics-label">Waitlist</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{formatUsd(analytics.revenueCents)}</span>
          <span className="ec-analytics-label">Revenue</span>
        </div>
      </div>

      <div className="ec-action-row">
        {status === "PUBLISHED" ? (
          <>
            <CopyRegistrationLink registrationUrl={registrationUrl} />
            <Link
              href={registrationPath}
              className="pc-btn-secondary min-h-11"
              target="_blank"
              rel="noopener noreferrer"
            >
              Public registration ↗
            </Link>
          </>
        ) : null}
        <EventExportButton orgSlug={orgSlug} eventId={eventId} eventTitle={eventTitle} />
        <Link href={`/${orgSlug}/calendar/feed.ics`} className="pc-btn-secondary">
          Calendar feed
        </Link>
      </div>
    </section>
  );
}
