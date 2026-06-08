import type { EventAnalytics } from "@/lib/event-analytics";
import { formatUsd } from "@/lib/event-analytics";

function formatLabel(format: string): string {
  if (format === "IN_PERSON") return "In person";
  if (format === "VIRTUAL") return "Virtual";
  return "Hybrid";
}

export function EventDetailSummary({
  analytics,
  statusLabel,
  format,
  venueName,
}: {
  analytics: EventAnalytics;
  statusLabel: string;
  format: string;
  venueName: string;
}) {
  return (
    <div className="pp-module-stats ec-detail-stats" role="region" aria-label="Event summary">
      <div className="pp-module-stat">
        <span className="pp-module-stat-value">{analytics.totalRegistrations}</span>
        <span className="pp-module-stat-label">Registrations</span>
      </div>
      <div className="pp-module-stat">
        <span className="pp-module-stat-value">{analytics.confirmed}</span>
        <span className="pp-module-stat-label">Confirmed</span>
      </div>
      <div className="pp-module-stat">
        <span className="pp-module-stat-value">{analytics.checkedIn}</span>
        <span className="pp-module-stat-label">Checked in</span>
      </div>
      <div className="pp-module-stat">
        <span className="pp-module-stat-value">{formatUsd(analytics.revenueCents)}</span>
        <span className="pp-module-stat-label">Revenue</span>
      </div>
      <div className="pp-module-stat ec-detail-stats-meta">
        <span className="pp-module-stat-value text-base">{statusLabel}</span>
        <span className="pp-module-stat-label">
          {formatLabel(format)}
          {venueName ? ` · ${venueName}` : ""}
        </span>
      </div>
    </div>
  );
}
