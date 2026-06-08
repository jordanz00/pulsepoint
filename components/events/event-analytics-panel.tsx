import type { EventAnalytics } from "@/lib/event-analytics";
import { formatUsd } from "@/lib/event-analytics";

export function EventAnalyticsPanel({ analytics }: { analytics: EventAnalytics }) {
  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-analytics">
      <h2 className="ec-panel-title">Analytics</h2>
      <p className="ec-panel-lead">
        Live counts from registrations—revenue includes paid registrations only.
      </p>

      <div className="ec-analytics-grid">
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.confirmed}</span>
          <span className="ec-analytics-label">Confirmed</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.pending}</span>
          <span className="ec-analytics-label">Pending</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.waitlist}</span>
          <span className="ec-analytics-label">Waitlist</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{analytics.checkedIn}</span>
          <span className="ec-analytics-label">Checked in</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">{formatUsd(analytics.revenueCents)}</span>
          <span className="ec-analytics-label">Revenue</span>
        </div>
        <div className="ec-analytics-stat">
          <span className="ec-analytics-value">
            {analytics.fillRatePct != null ? `${analytics.fillRatePct}%` : "—"}
          </span>
          <span className="ec-analytics-label">
            Fill rate{analytics.capacity ? ` (${analytics.capacity} cap)` : ""}
          </span>
        </div>
      </div>

      {analytics.registrationsByDay.length > 0 ? (
        <div className="ec-chart-bars mt-6">
          <h3 className="text-sm font-semibold text-[var(--readable-on-light-fg)]">
            Registrations by day
          </h3>
          <ul className="mt-3 space-y-2">
            {analytics.registrationsByDay.map((d) => (
              <li key={d.date} className="ec-bar-row">
                <span className="ec-bar-label">{d.date}</span>
                <span
                  className="ec-bar-fill"
                  style={{
                    width: `${Math.min(100, d.count * 12)}%`,
                  }}
                />
                <span className="ec-bar-count">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
