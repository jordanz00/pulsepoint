import Link from "next/link";
import {
  MEMBERSHIP_CLASS_LABEL,
  type MembershipClass,
} from "@/lib/membership-class";
import type { OverviewDuesSnapshot } from "@/lib/overview-dues-data";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function classBadge(cls: MembershipClass) {
  const short =
    cls === "general" ? "General" : cls === "associate" ? "Associate" : "Other";
  return (
    <span className={`pp-dues-class-badge pp-dues-class-badge--${cls}`}>{short}</span>
  );
}

export function OverviewDuesPanel({
  orgSlug,
  dues,
}: {
  orgSlug: string;
  dues: OverviewDuesSnapshot;
}) {
  const { membershipSplit: split } = dues;
  const donutGeneral = split.generalPct;
  const donutAssociate = split.associatePct;
  const donutOther = Math.max(0, 100 - donutGeneral - donutAssociate);

  return (
    <section className="pp-overview-dues glass pp-glass-surface" aria-labelledby="overview-dues-title">
      <header className="pp-overview-dues-head">
        <div>
          <p className="pp-overview-dues-eyebrow">MemberCore · Finance</p>
          <h2 id="overview-dues-title" className="pp-overview-dues-title">
            Dues &amp; renewals
          </h2>
          <p className="pp-overview-dues-sub">
            Unpaid renewal invoices and membership mix — updated from your live directory.
          </p>
        </div>
        <div className="pp-overview-dues-actions">
          <Link href={`/${orgSlug}/members/renewals`} className="pc-btn-primary text-sm">
            Renewal workspace
          </Link>
          <Link href={`/${orgSlug}/commerce`} className="pc-btn-secondary text-sm">
            Commerce
          </Link>
        </div>
      </header>

      <div className="pp-overview-dues-kpis" role="list">
        <div className="pp-overview-dues-kpi pp-overview-dues-kpi--alert" role="listitem">
          <span className="pp-overview-dues-kpi-value">{dues.unpaidInvoiceCount}</span>
          <span className="pp-overview-dues-kpi-label">Unpaid invoices</span>
          <span className="pp-overview-dues-kpi-meta">{fmtUsd(dues.unpaidInvoiceCents)} open</span>
        </div>
        <div className="pp-overview-dues-kpi" role="listitem">
          <span className="pp-overview-dues-kpi-value">{dues.renewalOverdue}</span>
          <span className="pp-overview-dues-kpi-label">Overdue renewals</span>
          <span className="pp-overview-dues-kpi-meta">Past due date</span>
        </div>
        <div className="pp-overview-dues-kpi" role="listitem">
          <span className="pp-overview-dues-kpi-value">{dues.renewalDue30}</span>
          <span className="pp-overview-dues-kpi-label">Due in 30 days</span>
          <span className="pp-overview-dues-kpi-meta">Outreach queue</span>
        </div>
        <div className="pp-overview-dues-kpi" role="listitem">
          <span className="pp-overview-dues-kpi-value">{split.general.toLocaleString()}</span>
          <span className="pp-overview-dues-kpi-label">General</span>
          <span className="pp-overview-dues-kpi-meta">{split.generalPct}% of active</span>
        </div>
        <div className="pp-overview-dues-kpi" role="listitem">
          <span className="pp-overview-dues-kpi-value">{split.associate.toLocaleString()}</span>
          <span className="pp-overview-dues-kpi-label">Associate</span>
          <span className="pp-overview-dues-kpi-meta">{split.associatePct}% of active</span>
        </div>
      </div>

      <div className="pp-overview-dues-grid">
        <article className="pp-overview-dues-card">
          <h3 className="pp-overview-dues-card-title">Membership mix</h3>
          <p className="pp-overview-dues-card-sub">
            {split.total.toLocaleString()} active members by tier class
          </p>
          <div
            className="pp-overview-dues-stack"
            role="img"
            aria-label={`General ${split.general}, Associate ${split.associate}, Other ${split.other}`}
          >
            {split.general > 0 ? (
              <span
                className="pp-overview-dues-stack-seg pp-overview-dues-stack-seg--general"
                style={{ width: `${donutGeneral}%` }}
              />
            ) : null}
            {split.associate > 0 ? (
              <span
                className="pp-overview-dues-stack-seg pp-overview-dues-stack-seg--associate"
                style={{ width: `${donutAssociate}%` }}
              />
            ) : null}
            {split.other > 0 ? (
              <span
                className="pp-overview-dues-stack-seg pp-overview-dues-stack-seg--other"
                style={{ width: `${donutOther}%` }}
              />
            ) : null}
          </div>
          <ul className="pp-overview-dues-legend">
            <li>
              <span className="pp-overview-dues-legend-dot pp-overview-dues-legend-dot--general" />
              {MEMBERSHIP_CLASS_LABEL.general} · {split.general}
            </li>
            <li>
              <span className="pp-overview-dues-legend-dot pp-overview-dues-legend-dot--associate" />
              {MEMBERSHIP_CLASS_LABEL.associate} · {split.associate}
            </li>
            {split.other > 0 ? (
              <li>
                <span className="pp-overview-dues-legend-dot pp-overview-dues-legend-dot--other" />
                {MEMBERSHIP_CLASS_LABEL.other} · {split.other}
              </li>
            ) : null}
          </ul>
        </article>

        <article className="pp-overview-dues-card">
          <h3 className="pp-overview-dues-card-title">Unpaid dues invoices</h3>
          <p className="pp-overview-dues-card-sub">Pending Commerce orders · DUES products</p>
          {dues.unpaidInvoices.length === 0 ? (
            <p className="pp-overview-dues-empty">No unpaid dues invoices right now.</p>
          ) : (
            <ul className="pp-overview-dues-table">
              {dues.unpaidInvoices.map((row) => (
                <li key={row.orderId} className="pp-overview-dues-row">
                  <div className="pp-overview-dues-row-main">
                    {row.memberId ? (
                      <Link href={`/${orgSlug}/members/${row.memberId}`} className="pp-overview-dues-link">
                        {row.memberName}
                      </Link>
                    ) : (
                      <span>{row.memberName}</span>
                    )}
                    <span className="pp-overview-dues-row-sub">{row.productName}</span>
                  </div>
                  <div className="pp-overview-dues-row-meta">
                    <span className="pp-overview-dues-amount">{fmtUsd(row.totalCents)}</span>
                    <span className="pp-overview-dues-date">
                      {row.createdAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="pp-overview-dues-card pp-overview-dues-card--wide">
          <h3 className="pp-overview-dues-card-title">Renewal tracking</h3>
          <p className="pp-overview-dues-card-sub">Overdue and due within 30 days</p>
          {dues.renewalQueue.length === 0 ? (
            <p className="pp-overview-dues-empty">No renewals due in the next 30 days.</p>
          ) : (
            <ul className="pp-overview-dues-table">
              {dues.renewalQueue.map((row) => (
                <li key={row.memberId} className="pp-overview-dues-row">
                  <div className="pp-overview-dues-row-main">
                    <Link href={`/${orgSlug}/members/${row.memberId}`} className="pp-overview-dues-link">
                      {row.memberName}
                    </Link>
                    <span className="pp-overview-dues-row-sub">
                      {row.tierName ?? "No tier"}
                      {" · "}
                      {classBadge(row.membershipClass)}
                    </span>
                  </div>
                  <div className="pp-overview-dues-row-meta">
                    <span
                      className={`pp-overview-dues-status pp-overview-dues-status--${row.state}`}
                    >
                      {row.state === "overdue"
                        ? `${Math.abs(row.daysUntilDue)}d overdue`
                        : `${row.daysUntilDue}d`}
                    </span>
                    <span className="pp-overview-dues-date">
                      {row.renewalDueAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/${orgSlug}/members/renewals`} className="pp-overview-dues-more">
            View all renewals →
          </Link>
        </article>
      </div>
    </section>
  );
}
