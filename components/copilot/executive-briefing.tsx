import { prisma } from "@/lib/prisma";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { buildExecutiveBrief } from "@/lib/copilot/executive-brief";
import { topicCardClass } from "@/lib/dashboard-topic-colors";
import { formatRelativeTime } from "@/lib/dashboard-glass";
import { FeatureIcon } from "@/components/marketing/feature-icon";

type Props = {
  orgSlug: string;
  /** Home dashboard: hide duplicate KPI snapshot row */
  variant?: "full" | "home";
};

export async function ExecutiveBriefing({ orgSlug, variant = "full" }: Props) {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const dashboard = await loadExecutiveDashboard(org.id);
  const brief = buildExecutiveBrief(dashboard);
  const now = new Date();
  const asOf = new Date(brief.dataAsOf).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section
      className={`pp-executive-briefing glass pp-glass-surface pp-topic-card pp-topic-card--activity${variant === "home" ? " pp-executive-briefing--home" : ""}`}
      aria-label="Executive briefing"
    >
      <header className="pp-executive-briefing-head">
        <div className="pp-executive-briefing-brand">
          <div className="pp-executive-briefing-title-row">
            <FeatureIcon icon="insights" productId="insights" size="sm" />
            <p className="pp-eyebrow">Executive copilot</p>
          </div>
          <h2 className="pp-executive-briefing-title">Your briefing</h2>
          <p className="pp-executive-briefing-lead">{brief.headline}</p>
        </div>
        <p className="pp-executive-briefing-asof">
          <span className="pp-executive-briefing-asof-label">Data as of</span>
          {asOf}
        </p>
      </header>

      {variant !== "home" && brief.snapshotStats.length > 0 ? (
        <div className="pp-executive-briefing-snapshot" role="list">
          {brief.snapshotStats.map((stat) => (
            <div
              key={stat.id}
              className={`pp-executive-briefing-stat ${topicCardClass(stat.topic)}`}
              role="listitem"
            >
              <span className="pp-executive-briefing-stat-label">{stat.label}</span>
              <span className="pp-executive-briefing-stat-value">{stat.value}</span>
              <span className="pp-executive-briefing-stat-why">{stat.whyItMatters}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="pp-executive-briefing-body">
        <div className={`pp-executive-briefing-col ${topicCardClass("finance")}`}>
          <h3 className="pp-executive-briefing-col-title">
            <span className="pp-topic-swatch pp-topic-swatch--finance" aria-hidden />
            At a glance
          </h3>
          <ul className="pp-executive-briefing-list">
            {brief.atAGlance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className={`pp-executive-briefing-col ${topicCardClass("attention")}`}>
          <h3 className="pp-executive-briefing-col-title">
            <span className="pp-topic-swatch pp-topic-swatch--attention" aria-hidden />
            Needs attention
          </h3>
          {brief.attentionItems.length > 0 ? (
            <ul className="pp-executive-briefing-attention">
              {brief.attentionItems.map((item) => (
                <li key={item.headline} className="pp-executive-briefing-attention-card">
                  <span className="pp-executive-briefing-attention-count">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="pp-executive-briefing-attention-copy">
                    <strong>{item.headline}</strong>
                    <span>{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pp-executive-briefing-empty">All clear — no urgent queues flagged.</p>
          )}
        </div>
      </div>

      <div className={`pp-executive-briefing-activity ${topicCardClass("activity")}`}>
        <h3 className="pp-executive-briefing-col-title">
          <span className="pp-topic-swatch pp-topic-swatch--activity" aria-hidden />
          What changed
        </h3>
        {brief.activityItems.length > 0 ? (
          <ul className="pp-executive-briefing-activity-list">
            {brief.activityItems.map((row) => (
              <li key={row.id} className="pp-executive-briefing-activity-row">
                <span
                  className={`pp-glass-activity-dot pp-glass-activity-dot--${row.kind}`}
                  aria-hidden
                />
                <span className="pp-executive-briefing-activity-copy">{row.summary}</span>
                <time
                  className="pp-executive-briefing-activity-time"
                  dateTime={row.when.toISOString()}
                  title={row.when.toLocaleString()}
                >
                  {formatRelativeTime(row.when, now)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pp-executive-briefing-empty">
            {brief.whatChanged[0] ?? "No recent staff actions logged yet."}
          </p>
        )}
      </div>
    </section>
  );
}
