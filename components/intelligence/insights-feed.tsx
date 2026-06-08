import Link from "next/link";
import { InsightCard } from "@/components/intelligence/insight-card";
import { loadOrgInsights } from "@/lib/intelligence/load-org-insights";
import type { OrgInsight } from "@/lib/intelligence/types";

export async function InsightsFeed({
  orgSlug,
  limit,
  showHeader = true,
  showViewAll = false,
  variant = "default",
}: {
  orgSlug: string;
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  variant?: "default" | "teaser";
}) {
  const result = await loadOrgInsights(orgSlug);
  if (!result) return null;

  const insights: OrgInsight[] = limit
    ? result.insights.slice(0, limit)
    : result.insights;

  const asOf = result.dataAsOf.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const feedClass =
    variant === "teaser" ? "intel-feed intel-feed--teaser" : "intel-feed";

  return (
    <section className={feedClass} aria-label="AMS Intelligence recommendations">
      {variant === "teaser" ? (
        <header className="intel-feed__teaser-head">
          <h2 className="intel-feed__teaser-title">Needs attention</h2>
          {result.counts.urgent > 0 ? (
            <span className="intel-feed__badge intel-feed__badge--urgent">
              {result.counts.urgent} urgent
            </span>
          ) : null}
        </header>
      ) : null}
      {showHeader ? (
        <header className="intel-feed__head">
          <div>
            <p className="intel-feed__eyebrow">AMS Intelligence</p>
            <h2 className="intel-feed__title">Recommended actions</h2>
            <p className="intel-feed__lead">
              Proactive signals from membership, events, sponsorship, advocacy, and committees.
            </p>
          </div>
          <div className="intel-feed__badges">
            {result.counts.urgent > 0 ? (
              <span className="intel-feed__badge intel-feed__badge--urgent">
                {result.counts.urgent} urgent
              </span>
            ) : null}
            {result.counts.important > 0 ? (
              <span className="intel-feed__badge intel-feed__badge--important">
                {result.counts.important} to review
              </span>
            ) : null}
          </div>
        </header>
      ) : null}

      <ul className="intel-feed__list">
        {insights.map((insight) => (
          <li key={insight.id}>
            <InsightCard insight={insight} />
          </li>
        ))}
      </ul>

      <footer className="intel-feed__foot">
        <p className="intel-feed__asof">Updated {asOf}</p>
        {showViewAll && limit && result.insights.length > limit ? (
          <Link href={`/${orgSlug}/intelligence`} className="intel-feed__view-all">
            View all {result.insights.length} insights
          </Link>
        ) : null}
      </footer>
    </section>
  );
}
