import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  buildComplianceApprovalQueue,
  buildComplianceOpsCards,
  formatAuditAction,
  type ComplianceOpsSnapshot,
} from "@/lib/compliance-ops";
import { MlrWorkflowRail } from "@/components/enterprise/mlr-workflow-rail";
import { ComplianceQaGates } from "@/components/enterprise/compliance-qa-gates";

export function ComplianceOpsBrief({
  snapshot,
  orgSlug,
}: {
  snapshot: ComplianceOpsSnapshot;
  orgSlug: string;
}) {
  const cards = buildComplianceOpsCards(snapshot, orgSlug);

  return (
    <section className="pp-ops-brief" aria-labelledby="pp-compliance-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Compliance briefing</p>
        <h2 id="pp-compliance-ops-brief-title" className="pp-ops-brief__title">
          Five questions this compliance center answers
        </h2>
        <p className="pp-compliance-trust-note">
          Alpha presentation — audit visibility and approval workflows. Not a certified compliance
          or MLR certification.
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

export function ComplianceApprovalPanels({
  snapshot,
  orgSlug,
}: {
  snapshot: ComplianceOpsSnapshot;
  orgSlug: string;
}) {
  const panels = buildComplianceApprovalQueue(snapshot, orgSlug);

  return (
    <section className="pp-cc-operator pp-compliance-approvals" aria-label="Approval queues">
      {panels.map((panel) => (
        <Link
          key={panel.id}
          href={panel.href}
          className={`pp-cc-operator__panel glass pp-glass-surface pp-cc-operator__panel--${panel.status}`}
        >
          <p className="pp-cc-operator__title">{panel.title}</p>
          <p className="pp-cc-operator__value">
            {panel.count !== undefined && panel.count > 0 ? String(panel.count) : panel.status === "clear" ? "Clear" : "Review"}
          </p>
          <p className="pp-cc-operator__detail">{panel.detail}</p>
        </Link>
      ))}
    </section>
  );
}

export function ComplianceAuditTimeline({
  rows,
  orgSlug,
  adOpsAudit,
}: {
  rows: ComplianceOpsSnapshot["recentAudit"];
  orgSlug: string;
  adOpsAudit: ComplianceOpsSnapshot["adOps"];
}) {
  return (
    <div className="pp-compliance-timeline-grid">
      <section className="pp-compliance-timeline glass pp-glass-surface">
        <div className="pp-compliance-timeline__head">
          <h2 className="pc-section-title">Staff audit trail</h2>
          <Link href={`/${orgSlug}/audit`} className="pc-btn-secondary text-sm">
            Full log
          </Link>
        </div>
        {rows.length === 0 ? (
          <p className="pp-compliance-timeline__empty">No audit entries yet.</p>
        ) : (
          <ol className="pp-compliance-timeline__list">
            {rows.map((row) => (
              <li key={row.id} className="pp-compliance-timeline__row">
                <span className="pp-compliance-timeline__dot" aria-hidden />
                <div className="pp-compliance-timeline__body">
                  <p className="pp-compliance-timeline__summary">
                    <strong>{row.entity}</strong> · {formatAuditAction(row.action)}
                  </p>
                  <time className="pp-compliance-timeline__time" dateTime={row.createdAt.toISOString()}>
                    {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="pp-compliance-timeline glass pp-glass-surface">
        <div className="pp-compliance-timeline__head">
          <h2 className="pc-section-title">Ad-ops change log</h2>
          <Link href={`/${orgSlug}/advertising/audit`} className="pc-btn-secondary text-sm">
            Ad audit
          </Link>
        </div>
        {!adOpsAudit ? (
          <p className="pp-compliance-timeline__empty">
            Ad-ops API not connected — start @ams/api to view MLR and trafficking audit.
          </p>
        ) : adOpsAudit.recentAudit.length === 0 ? (
          <p className="pp-compliance-timeline__empty">No ad-ops audit entries.</p>
        ) : (
          <ol className="pp-compliance-timeline__list">
            {adOpsAudit.recentAudit.map((row) => (
              <li key={row.id} className="pp-compliance-timeline__row">
                <span className="pp-compliance-timeline__dot pp-compliance-timeline__dot--ad" aria-hidden />
                <div className="pp-compliance-timeline__body">
                  <p className="pp-compliance-timeline__summary">
                    <strong>{row.entityType}</strong> · {row.action.replace(/-/g, " ")}
                    {row.actorEmail ? ` · ${row.actorEmail}` : ""}
                  </p>
                  <time className="pp-compliance-timeline__time" dateTime={row.createdAt}>
                    {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export function ComplianceMlrSection({
  adOps,
  orgSlug,
}: {
  adOps: ComplianceOpsSnapshot["adOps"];
  orgSlug: string;
}) {
  return (
    <section className="pp-compliance-mlr glass pp-glass-surface">
      <div className="pp-compliance-mlr__head">
        <div>
          <h2 className="pc-section-title">MLR & trafficking workflow</h2>
          <p className="pp-compliance-mlr__lead">
            Creative lifecycle for healthcare advertising — every transition logged in ad-ops audit.
          </p>
        </div>
        <Link href={`/${orgSlug}/advertising/onboarding`} className="pc-btn-secondary text-sm">
          Onboarding checklist
        </Link>
      </div>

      <MlrWorkflowRail currentState="SUBMITTED" />

      {adOps ? (
        <div className="pp-compliance-mlr__stats">
          <ComplianceStat label="Ad campaigns" value={adOps.campaignsTotal} />
          <ComplianceStat label="In QA state" value={adOps.campaignsInQa} tone={adOps.campaignsInQa > 0 ? "watch" : "clear"} />
          <ComplianceStat label="Pending QA gates" value={adOps.pendingQaGates} tone={adOps.pendingQaGates > 0 ? "watch" : "clear"} />
          <ComplianceStat label="Missing MLR QA" value={adOps.pendingCreativeQa} tone={adOps.pendingCreativeQa > 0 ? "action" : "clear"} />
        </div>
      ) : (
        <p className="pp-compliance-timeline__empty">
          Connect ad-ops API for live MLR queue counts.
        </p>
      )}

      <p className="pp-compliance-mlr__gates-label">Required gates before trafficking</p>
      <ComplianceQaGates
        audiencePassed={adOps ? adOps.pendingAudienceQa === 0 : undefined}
        budgetPassed={adOps ? adOps.pendingBudgetQa === 0 : undefined}
        creativePassed={adOps ? adOps.pendingCreativeQa === 0 : undefined}
        compact
      />
    </section>
  );
}

function ComplianceStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "watch" | "action" | "clear";
}) {
  return (
    <div className={`pp-compliance-stat pp-compliance-stat--${tone}`}>
      <span className="pp-compliance-stat__label">{label}</span>
      <span className="pp-compliance-stat__value">{value}</span>
    </div>
  );
}
