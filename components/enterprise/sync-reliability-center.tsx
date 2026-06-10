import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  buildSyncOpsCards,
  syncHealthStatus,
  type SyncOpsSnapshot,
} from "@/lib/sync-ops";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

export function SyncOpsBrief({ snapshot, orgSlug }: { snapshot: SyncOpsSnapshot; orgSlug: string }) {
  const cards = buildSyncOpsCards(snapshot, orgSlug);
  const health = syncHealthStatus(snapshot);

  return (
    <section className="pp-ops-brief" aria-labelledby="pp-sync-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Reliability briefing</p>
        <h2 id="pp-sync-ops-brief-title" className="pp-ops-brief__title">
          Five questions this sync center answers
        </h2>
        <p className={`pp-sync-health pp-sync-health--${health}`}>
          Sync health: {health === "healthy" ? "Healthy" : health === "degraded" ? "Degraded" : "Critical"}
        </p>
      </header>
      <ol className="pp-ops-brief__grid">
        {cards.map((card, index) => (
          <li
            key={card.id}
            className={`pp-ops-brief__card glass pp-glass-surface pp-ops-brief__card--${card.tone ?? "neutral"}`}
          >
            <span className="pp-ops-brief__num">{index + 1}</span>
            <h3 className="pp-ops-brief__question">{card.question}</h3>
            <p className="pp-ops-brief__answer">{card.answer}</p>
            {card.href ? (
              <Link href={card.href} className="pp-ops-brief__link">
                Open →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SyncFailureQueue({ snapshot }: { snapshot: SyncOpsSnapshot }) {
  return (
    <section className="pp-sync-failures glass pp-glass-surface" aria-label="Failures and pending sync">
      <h2 className="pc-section-title">Failure queue</h2>
      <p className="pp-sync-failures__lead">Nothing silent — every block has a recovery path.</p>
      {snapshot.recentFailures.length === 0 ? (
        <EnterpriseStatePanel
          variant="clear"
          title="No open failures"
          description="Every sync queue is healthy — nothing blocking imports, automation, or ad-ops trafficking."
        />
      ) : (
        <ul className="pp-sync-failures__list">
          {snapshot.recentFailures.map((row) => (
            <li key={`${row.source}-${row.id}`}>
              <Link href={row.href} className="pp-sync-failures__row">
                <span className={`pp-sync-failures__source pp-sync-failures__source--${row.source}`}>
                  {row.source}
                </span>
                <span className="pp-sync-failures__label">{row.label}</span>
                <span className="pp-sync-failures__status">{row.status}</span>
                <span className="pp-sync-failures__detail">
                  {row.errorCode ? `${row.errorCode} · ` : ""}
                  {row.errorDetail ?? "Review required"}
                </span>
                <time className="pp-sync-failures__time" dateTime={row.createdAt.toISOString()}>
                  {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SyncRecoveryPaths({ orgSlug }: { orgSlug: string }) {
  const paths = [
    { label: "Exceptions queue", href: `/${orgSlug}/exceptions`, detail: "Resolve automation failures" },
    { label: "Member imports", href: `/${orgSlug}/members/imports`, detail: "Approve staged CSV rows" },
    { label: "Ad-ops sync", href: `/${orgSlug}/advertising/sync`, detail: "DSP job status & retry" },
    { label: "Audit trail", href: `/${orgSlug}/audit`, detail: "Who changed what" },
    { label: "Compliance center", href: `/${orgSlug}/compliance`, detail: "Approval visibility" },
  ];

  return (
    <nav className="pp-sync-recovery" aria-label="Recovery paths">
      <ul className="pp-crm-paths__grid">
        {paths.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="pp-crm-paths__card glass pp-glass-surface">
              <span className="pp-crm-paths__label">{p.label}</span>
              <span className="pp-crm-paths__detail">{p.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
