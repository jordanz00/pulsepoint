import Link from "next/link";
import {
  TOP_20_FEATURES,
  featureHref,
  type Top20Feature,
  type Top20FeatureStatus,
} from "@/lib/top-20-features";
import type { Top20FeatureStats } from "@/lib/load-top-20-feature-stats";

const STATUS_BADGE: Record<Top20FeatureStatus, string> = {
  live: "badge-live",
  alpha: "badge-alpha",
  demo: "badge-alpha",
};

const STATUS_LABEL: Record<Top20FeatureStatus, string> = {
  live: "Live",
  alpha: "Alpha",
  demo: "Demo preview",
};

function FeatureCard({
  feature,
  orgSlug,
  stat,
}: {
  feature: Top20Feature;
  orgSlug: string;
  stat?: { value: string; label: string; pathOverride?: string };
}) {
  const href = featureHref(orgSlug, feature, stat);

  return (
    <li>
      <Link href={href} className="pp-top20-card glass pp-glass-surface">
        <div className="pp-top20-card__head">
          <span className="pp-top20-card__rank">#{feature.rank}</span>
          <span className={STATUS_BADGE[feature.status]}>{STATUS_LABEL[feature.status]}</span>
          {feature.tier === 1 ? (
            <span className="pp-top20-card__tier">Portfolio</span>
          ) : null}
        </div>
        <p className="pp-top20-card__module">{feature.module}</p>
        <h3 className="pp-top20-card__title">{feature.title}</h3>
        <p className="pp-top20-card__hook">{feature.hook}</p>
        {stat ? (
          <p className="pp-top20-card__stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </p>
        ) : null}
        <ul className="pp-top20-card__tags">
          {feature.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <span className="pp-top20-card__cta">Open feature →</span>
      </Link>
    </li>
  );
}

export function Top20Showcase({
  orgSlug,
  stats,
  dataAsOf,
}: {
  orgSlug: string;
  stats: Top20FeatureStats;
  dataAsOf: string;
}) {
  const tier1 = TOP_20_FEATURES.filter((f) => f.tier === 1);
  const tier2 = TOP_20_FEATURES.filter((f) => f.tier === 2);

  return (
    <div className="pp-top20-showcase">
      <section className="pp-top20-showcase__hero glass pp-glass-surface">
        <p className="pp-top20-showcase__eyebrow">PulsePoint AMS</p>
        <h2 className="pp-top20-showcase__title">Top 20 feature showcase</h2>
        <p className="pp-top20-showcase__lead">
          Highly visible, dynamic, demo-ready surfaces — each card links to a live route with a
          tenant stat. Data as of {dataAsOf}.
        </p>
        <div className="pp-top20-showcase__actions">
          <Link href={`/${orgSlug}/leadership`} className="pc-btn-primary text-sm">
            Start leadership loop
          </Link>
          <Link href={`/${orgSlug}/walkthrough?step=0`} className="pc-btn-secondary text-sm">
            Full guided tour
          </Link>
        </div>
      </section>

      <section aria-labelledby="top20-tier1-heading">
        <header className="pp-top20-showcase__section-head">
          <h3 id="top20-tier1-heading" className="pp-demo-panel-title">
            Tier 1 — Portfolio & executive
          </h3>
          <p className="pp-demo-panel-sub">Best for 15-minute investor and board demos.</p>
        </header>
        <ul className="pp-top20-showcase__grid">
          {tier1.map((f) => (
            <FeatureCard key={f.id} feature={f} orgSlug={orgSlug} stat={stats[f.statKey]} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="top20-tier2-heading">
        <header className="pp-top20-showcase__section-head">
          <h3 id="top20-tier2-heading" className="pp-demo-panel-title">
            Tier 2 — Full-suite depth
          </h3>
          <p className="pp-demo-panel-sub">Membership, programs, revenue, and competitive frame.</p>
        </header>
        <ul className="pp-top20-showcase__grid">
          {tier2.map((f) => (
            <FeatureCard key={f.id} feature={f} orgSlug={orgSlug} stat={stats[f.statKey]} />
          ))}
        </ul>
      </section>
    </div>
  );
}
