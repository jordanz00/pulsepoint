import Link from "next/link";
import {
  FLAGSHIP_FEATURES,
  flagshipHubHref,
  flagshipChildHref,
  type FlagshipFeature,
  type FlagshipFeatureStatus,
} from "@/lib/flagship-features";
import type { FlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";

const STATUS_BADGE: Record<FlagshipFeatureStatus, string> = {
  live: "badge-live",
  alpha: "badge-alpha",
  demo: "badge-alpha",
};

const STATUS_LABEL: Record<FlagshipFeatureStatus, string> = {
  live: "Live",
  alpha: "Alpha",
  demo: "Demo preview",
};

function FeatureCard({
  feature,
  orgSlug,
  stat,
}: {
  feature: FlagshipFeature;
  orgSlug: string;
  stat?: { value: string; label: string; secondary?: { value: string; label: string }[] };
}) {
  const hubHref = flagshipHubHref(orgSlug, feature);
  const primaryDemo = feature.childRoutes[0];

  return (
    <li>
      <article className="pp-flagship5-card glass pp-glass-surface">
        <div className="pp-flagship5-card__head">
          <span className="pp-flagship5-card__rank">#{feature.rank}</span>
          <span className={STATUS_BADGE[feature.status]}>{STATUS_LABEL[feature.status]}</span>
        </div>
        <p className="pp-flagship5-card__module">{feature.module}</p>
        <h3 className="pp-flagship5-card__title">{feature.title}</h3>
        <p className="pp-flagship5-card__hook">{feature.hook}</p>
        {stat ? (
          <p className="pp-flagship5-card__stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </p>
        ) : null}
        {stat?.secondary?.[0] ? (
          <p className="pp-flagship5-card__stat pp-flagship5-card__stat--secondary">
            <strong>{stat.secondary[0].value}</strong>
            <span>{stat.secondary[0].label}</span>
          </p>
        ) : null}
        <ul className="pp-flagship5-card__tags">
          {feature.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className="pp-flagship5-card__actions">
          <Link href={hubHref} className="pc-btn-primary text-sm">
            Open hub
          </Link>
          {primaryDemo ? (
            <Link
              href={flagshipChildHref(orgSlug, primaryDemo)}
              className="pc-btn-secondary text-sm"
            >
              Jump to demo
            </Link>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export function FlagshipShowcase({
  orgSlug,
  stats,
  dataAsOf,
}: {
  orgSlug: string;
  stats: FlagshipFeatureStats;
  dataAsOf: string;
}) {
  return (
    <div className="pp-flagship5-showcase">
      <section className="pp-flagship5-showcase__hero glass pp-glass-surface">
        <p className="pp-flagship5-showcase__eyebrow">PulsePoint AMS</p>
        <h2 className="pp-flagship5-showcase__title">Flagship features</h2>
        <p className="pp-flagship5-showcase__lead">
          Executive visibility, membership health, integrated advocacy, board reporting, and
          honest migration — on one AMS. Data as of {dataAsOf}.
        </p>
        <div className="pp-flagship5-showcase__actions">
          <Link
            href={`/${orgSlug}/flagship/walkthrough?step=0`}
            className="pc-btn-primary text-sm"
          >
            Start 5-stop walkthrough
          </Link>
          <Link href={`/${orgSlug}/command-center`} className="pc-btn-secondary text-sm">
            Command center
          </Link>
        </div>
      </section>

      <ul className="pp-flagship5-showcase__grid" aria-label="Flagship features">
        {FLAGSHIP_FEATURES.map((f) => (
          <FeatureCard key={f.id} feature={f} orgSlug={orgSlug} stat={stats[f.id]} />
        ))}
      </ul>

      <footer className="pp-flagship5-showcase__footer">
        <p>
          Need full-suite depth?{" "}
          <Link href={`/${orgSlug}/showcase`} className="pp-link">
            See all 20 features →
          </Link>
        </p>
      </footer>
    </div>
  );
}
