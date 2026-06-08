import Link from "next/link";
import {
  INSIGHT_DOMAIN_LABELS,
  type OrgInsight,
} from "@/lib/intelligence/types";

const PRIORITY_LABEL = {
  urgent: "Act now",
  important: "Review",
  info: "Note",
} as const;

export function InsightCard({ insight }: { insight: OrgInsight }) {
  return (
    <Link href={insight.href} className={`intel-card intel-card--${insight.priority}`}>
      <div className="intel-card__meta">
        <span className={`intel-card__priority intel-card__priority--${insight.priority}`}>
          {PRIORITY_LABEL[insight.priority]}
        </span>
        <span className="intel-card__domain">{INSIGHT_DOMAIN_LABELS[insight.domain]}</span>
      </div>
      <p className="intel-card__title">{insight.title}</p>
      <p className="intel-card__action">{insight.action}</p>
      {insight.metricValue !== undefined && insight.metricLabel ? (
        <p className="intel-card__metric">
          <span className="intel-card__metric-value">{insight.metricValue}</span>
          <span className="intel-card__metric-label">{insight.metricLabel}</span>
        </p>
      ) : null}
    </Link>
  );
}
