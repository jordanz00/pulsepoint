import Link from "next/link";
import {
  buildCrmOpsCards,
  buildCrmOperatorPanels,
  buildCrmRelationshipQueue,
  type CrmOpsSnapshot,
} from "@/lib/crm-ops";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

const PRIORITY_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export function CrmOpsBrief({ snapshot, orgSlug }: { snapshot: CrmOpsSnapshot; orgSlug: string }) {
  const cards = buildCrmOpsCards(snapshot, orgSlug);

  return (
    <section className="pp-ops-brief" aria-labelledby="pp-crm-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Relationship briefing</p>
        <h2 id="pp-crm-ops-brief-title" className="pp-ops-brief__title">
          Five questions this CRM hub answers
        </h2>
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

export function CrmOperatorPanels({ snapshot, orgSlug }: { snapshot: CrmOpsSnapshot; orgSlug: string }) {
  const panels = buildCrmOperatorPanels(snapshot, orgSlug);

  return (
    <section className="pp-cc-operator pp-crm-operator" aria-label="CRM operator status">
      {panels.map((panel) => (
        <Link
          key={panel.id}
          href={panel.href}
          className={`pp-cc-operator__panel glass pp-glass-surface pp-cc-operator__panel--${panel.status}`}
        >
          <p className="pp-cc-operator__title">{panel.title}</p>
          <p className="pp-cc-operator__value">{panel.value}</p>
          <p className="pp-cc-operator__detail">{panel.detail}</p>
        </Link>
      ))}
    </section>
  );
}

export function CrmRelationshipQueue({ snapshot, orgSlug }: { snapshot: CrmOpsSnapshot; orgSlug: string }) {
  const items = buildCrmRelationshipQueue(snapshot, orgSlug);

  return (
    <section className="pp-crm-queue glass pp-glass-surface" aria-label="Relationship queue">
      <div className="pp-crm-queue__head">
        <h2 className="pc-section-title">Relationship queue</h2>
        <Link href={`/${orgSlug}/members`} className="pc-btn-secondary text-sm">
          Member directory
        </Link>
      </div>
      {items.length === 0 ? (
        <EnterpriseStatePanel
          variant="clear"
          title="Queue clear"
          description="No overdue follow-ups or at-risk flags on the active roster."
        />
      ) : (
        <ul className="pp-crm-queue__list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="pp-crm-queue__row">
                <span className={`pp-crm-queue__priority pp-crm-queue__priority--${item.priority}`}>
                  {PRIORITY_LABEL[item.priority]}
                </span>
                <span className="pp-crm-queue__name">{item.name}</span>
                <span className="pp-crm-queue__detail">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CrmQuickPaths({ orgSlug }: { orgSlug: string }) {
  const paths = [
    { label: "Organizations", href: `/${orgSlug}/enterprise/organizations`, detail: "Hospital accounts" },
    { label: "Unify contacts", href: `/${orgSlug}/crm/unify`, detail: "Merge duplicates" },
    { label: "Partnership pipeline", href: `/${orgSlug}/deals/pipeline`, detail: "Drag stages" },
    { label: "Engage inbox", href: `/${orgSlug}/engage`, detail: "Email & audiences" },
    { label: "Prospector", href: `/${orgSlug}/crm/prospector`, detail: "Find new contacts" },
    { label: "Workflows", href: `/${orgSlug}/crm/workflows`, detail: "Automated nurture" },
  ];

  return (
    <nav className="pp-crm-paths" aria-label="CRM quick paths">
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
