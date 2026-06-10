import Link from "next/link";
import {
  buildAdvocacyCampaignWorkflowSteps,
  deriveAdvocacyCampaignLifecycle,
  LIFECYCLE_META,
  participationPct,
  type AdvocacyCampaignRecord,
} from "@/lib/advocacy-campaign-ops";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

export function AdvocacyCampaignStatusBadge({
  campaign,
}: {
  campaign: Pick<
    AdvocacyCampaignRecord,
    "isActive" | "audienceId" | "responseCount" | "targetCount" | "endsAt"
  >;
}) {
  const lifecycle = deriveAdvocacyCampaignLifecycle(campaign);
  const meta = LIFECYCLE_META[lifecycle];
  return (
    <span className={`pp-campaign-os__status pp-campaign-os__status--${meta.tone}`}>
      {meta.label}
    </span>
  );
}

export function AdvocacyCampaignBoard({
  orgSlug,
  campaigns,
}: {
  orgSlug: string;
  campaigns: AdvocacyCampaignRecord[];
}) {
  if (campaigns.length === 0) {
    return (
      <EnterpriseStatePanel
        variant="empty"
        title="No active campaigns"
        description="Create a campaign below, then launch take-action to wire Engage and the public hospital form."
      />
    );
  }

  return (
    <ul className="pp-campaign-os__board">
      {campaigns.map((c) => {
        const target = c.targetCount > 0 ? c.targetCount : null;
        const pct = target ? participationPct(c.responseCount, target) : 0;
        const href = `/${orgSlug}/enterprise/advocacy/campaigns/${c.id}`;

        return (
          <li key={c.id}>
            <Link href={href} className="pp-campaign-os__row glass pp-glass-surface">
              <div className="pp-campaign-os__row-main">
                <AdvocacyCampaignStatusBadge campaign={c} />
                <span className="pp-campaign-os__name">{c.name}</span>
                {c.issue ? (
                  <span className="pp-campaign-os__issue">
                    {c.issue.title}
                    {c.issue.billNumber ? ` · ${c.issue.billNumber}` : ""}
                  </span>
                ) : null}
              </div>
              <div className="pp-campaign-os__row-meta">
                <span className="pp-campaign-os__count">
                  {c.responseCount}/{target ?? "—"} hospitals
                </span>
                {target ? (
                  <div className="pp-campaign-os__track" aria-hidden>
                    <span className="pp-campaign-os__fill" style={{ width: `${pct}%` }} />
                  </div>
                ) : null}
                <span className="pp-campaign-os__open">Open campaign →</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdvocacyCampaignWorkflow({
  campaign,
}: {
  campaign: AdvocacyCampaignRecord;
}) {
  const steps = buildAdvocacyCampaignWorkflowSteps(campaign);

  return (
    <ol className="pp-campaign-os__workflow">
      {steps.map((step) => (
        <li
          key={step.id}
          className={`pp-campaign-os__step${step.complete ? " is-complete" : ""}${step.current ? " is-current" : ""}`}
        >
          <span className="pp-campaign-os__step-marker" aria-hidden />
          <div className="pp-campaign-os__step-body">
            <p className="pp-campaign-os__step-label">{step.label}</p>
            <p className="pp-campaign-os__step-detail">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AdvocacyCampaignOpsBrief({
  cards,
}: {
  cards: ReturnType<typeof import("@/lib/advocacy-campaign-ops").buildAdvocacyCampaignOpsCards>;
}) {
  return (
    <section className="pp-ops-brief" aria-labelledby="pp-campaign-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Campaign briefing</p>
        <h2 id="pp-campaign-ops-brief-title" className="pp-ops-brief__title">
          Five questions this campaign answers
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
          </li>
        ))}
      </ol>
    </section>
  );
}
