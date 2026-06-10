import Link from "next/link";
import {
  getFlagshipFeatureById,
  flagshipChildHref,
  type FlagshipFeatureStatus,
} from "@/lib/flagship-features";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

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

export function FlagshipHubShell({
  featureId,
  orgSlug,
  stat,
  children,
}: {
  featureId: string;
  orgSlug: string;
  stat: FlagshipFeatureStat;
  children?: React.ReactNode;
}) {
  const feature = getFlagshipFeatureById(featureId);
  if (!feature) return null;

  const stats = [
    { value: stat.value, label: stat.label },
    ...(stat.secondary ?? []),
  ];

  return (
    <div className="pp-flagship5-hub">
      <section className="pp-flagship5-hub__hero glass pp-glass-surface">
        <p className="pp-flagship5-showcase__eyebrow">Flagship · {feature.module}</p>
        <div className="pp-flagship5-card__head">
          <h2 className="pp-flagship5-showcase__title">{feature.title}</h2>
          <span className={STATUS_BADGE[feature.status]}>{STATUS_LABEL[feature.status]}</span>
        </div>
        <p className="pp-flagship5-showcase__lead">{feature.hook}</p>
        <div className="pp-flagship5-hub__stats" aria-label="Live tenant stats">
          {stats.map((s) => (
            <div key={`${s.value}-${s.label}`} className="pp-flagship5-hub__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <nav className="pp-flagship5-hub__routes" aria-label="Demo routes">
          {feature.childRoutes.map((route) => (
            <Link
              key={route.path}
              href={flagshipChildHref(orgSlug, route)}
              className="pp-flagship5-hub__route"
            >
              {route.label}
              <span aria-hidden>→</span>
            </Link>
          ))}
        </nav>
        {feature.disclaimer ? (
          <p className="pp-flagship5-hub__disclaimer">{feature.disclaimer}</p>
        ) : null}
      </section>

      {children ? <div className="pp-flagship5-hub__panel">{children}</div> : null}

      <p className="pp-flagship5-showcase__footer">
        <Link href={`/${orgSlug}/flagship`}>← All flagship features</Link>
      </p>
    </div>
  );
}
