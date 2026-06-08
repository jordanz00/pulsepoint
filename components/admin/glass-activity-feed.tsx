import type { ActivityKind } from "@/lib/dashboard-glass";
import { formatRelativeTime } from "@/lib/dashboard-glass";

export type GlassActivityItem = {
  id: string;
  summary: string;
  when: Date;
  kind: ActivityKind;
};

export function GlassActivityFeed({
  title = "Activity",
  items,
}: {
  title?: string;
  items: GlassActivityItem[];
}) {
  const now = new Date();

  return (
    <section
      className="pp-glass-activity glass pp-glass-surface pp-topic-card pp-topic-card--activity"
      aria-label={title}
    >
      <h2 className="pp-glass-activity-title">{title}</h2>
      {items.length === 0 ? (
        <p className="pp-glass-activity-empty">No recent activity yet.</p>
      ) : (
        <ul className="pp-glass-activity-list">
          {items.map((row) => (
            <li key={row.id} className="pp-glass-activity-row">
              <span
                className={`pp-glass-activity-dot pp-glass-activity-dot--${row.kind}`}
                aria-hidden
              />
              <span className="pp-glass-activity-copy">{row.summary}</span>
              <time
                className="pp-glass-activity-time"
                dateTime={row.when.toISOString()}
                title={row.when.toLocaleString()}
              >
                {formatRelativeTime(row.when, now)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
