import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type {
  CeoAdvocacyIssue,
  CeoCommitteeAlert,
  CeoEventHighlight,
} from "@/lib/ceo-command-center-data";

function PanelShell({
  eyebrow,
  title,
  href,
  linkLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="ceo-domain-panel ds-card ds-glass">
      <header className="ceo-panel__head ceo-panel__head--compact">
        <div>
          <p className="ceo-panel__eyebrow">{eyebrow}</p>
          <h2 className="ceo-panel__title">{title}</h2>
        </div>
        <Link href={href} className="ceo-domain-panel__link">
          {linkLabel}
        </Link>
      </header>
      {children}
    </section>
  );
}

export function CeoEventsPanel({
  orgSlug,
  upcoming,
  highlights,
}: {
  orgSlug: string;
  upcoming: number;
  highlights: CeoEventHighlight[];
}) {
  return (
    <PanelShell
      eyebrow="Events"
      title="What is succeeding"
      href={`/${orgSlug}/events`}
      linkLabel="EventCore"
    >
      <p className="ceo-domain-panel__lead">
        {upcoming} upcoming published event{upcoming === 1 ? "" : "s"} on the calendar.
      </p>
      {highlights.length === 0 ? (
        <p className="ceo-domain-panel__empty">No registration data yet.</p>
      ) : (
        <ul className="ceo-domain-panel__list">
          {highlights.map((e) => (
            <li key={e.id} className="ceo-domain-panel__row">
              <div>
                <p className="ceo-domain-panel__row-title">{e.title}</p>
                <p className="ceo-domain-panel__row-meta">
                  {format(e.startsAt, "MMM d, yyyy")} · {e.registrations} registered
                  {e.fillPct !== null ? ` · ${e.fillPct}% capacity` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

export function CeoCommitteesPanel({
  orgSlug,
  total,
  alerts,
}: {
  orgSlug: string;
  total: number;
  alerts: CeoCommitteeAlert[];
}) {
  return (
    <PanelShell
      eyebrow="Governance"
      title="Committees needing attention"
      href={`/${orgSlug}/committees`}
      linkLabel="Committees"
    >
      <p className="ceo-domain-panel__lead">
        {total} active committee{total === 1 ? "" : "s"} in the roster.
      </p>
      {alerts.length === 0 ? (
        <p className="ceo-domain-panel__empty">All committees have adequate membership.</p>
      ) : (
        <ul className="ceo-domain-panel__list">
          {alerts.map((c) => (
            <li key={c.id} className="ceo-domain-panel__row">
              <p className="ceo-domain-panel__row-title">{c.name}</p>
              <p className="ceo-domain-panel__row-meta">{c.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

export function CeoAdvocacyPanel({
  orgSlug,
  activeCount,
  issues,
}: {
  orgSlug: string;
  activeCount: number;
  issues: CeoAdvocacyIssue[];
}) {
  return (
    <PanelShell
      eyebrow="Advocacy"
      title="Active policy issues"
      href={`/${orgSlug}/enterprise/advocacy/issues`}
      linkLabel="Issue hub"
    >
      <p className="ceo-domain-panel__lead">
        {activeCount} issue{activeCount === 1 ? "" : "s"} tracked or active.
      </p>
      {issues.length === 0 ? (
        <p className="ceo-domain-panel__empty">No active advocacy issues in the catalog.</p>
      ) : (
        <ul className="ceo-domain-panel__list">
          {issues.map((i) => (
            <li key={i.id} className="ceo-domain-panel__row">
              {i.publicSlug ? (
                <Link
                  href={`/${orgSlug}/advocacy/issues/${i.publicSlug}`}
                  className="ceo-domain-panel__row-title block hover:underline"
                >
                  {i.title}
                </Link>
              ) : (
                <p className="ceo-domain-panel__row-title">{i.title}</p>
              )}
              <p className="ceo-domain-panel__row-meta">
                {i.status} · {i.jurisdiction}
                {i.activeCampaigns > 0
                  ? ` · ${i.activeCampaigns} campaign${i.activeCampaigns === 1 ? "" : "s"}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
