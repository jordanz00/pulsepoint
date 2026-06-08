import Link from "next/link";
import type { MembershipAnalytics } from "@/lib/membership-analytics";
import { AnimatedBarList } from "@/components/charts/animated-bar-list";
import { EngagementTierViz } from "@/components/admin/engagement-tier-viz";
import { DashboardTopicLegend } from "@/components/admin/dashboard-topic-legend";
import { GlassStatCardLive } from "@/components/admin/glass-stat-card-live";
import type { EngagementTier } from "@/lib/engagement-score";

function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const ENGAGEMENT_COLORS: Record<string, string> = {
  active: "var(--pp-tier-active)",
  moderate: "var(--pp-tier-moderate)",
  at_risk: "var(--pp-tier-atrisk)",
  inactive: "var(--pp-tier-inactive)",
};

export function MembershipAnalyticsDashboard({
  data,
  orgSlug,
}: {
  data: MembershipAnalytics;
  orgSlug: string;
}) {
  const { totals } = data;

  return (
    <div className="pp-membership-analytics space-y-10">
      <DashboardTopicLegend />
      <p className="text-xs text-[var(--pc-text-tertiary)]">
        Data as of {data.dataAsOf.toLocaleString()}
      </p>

      <section aria-labelledby="ma-kpi-heading">
        <h2 id="ma-kpi-heading" className="pc-simple-section-title">
          Membership health
        </h2>
        <div className="pp-glass-stat-grid mt-4">
          <GlassStatCardLive
            label="Active members"
            value={formatCount(totals.active)}
            numericValue={totals.active}
            delta={null}
          />
          <GlassStatCardLive
            label="Retention rate"
            value={
              data.retentionRatePct != null ? `${data.retentionRatePct}%` : "—"
            }
            numericValue={data.retentionRatePct ?? 0}
            delta={null}
          />
          <GlassStatCardLive
            label="Renewals due (30 days)"
            value={formatCount(totals.renewalDue30)}
            numericValue={totals.renewalDue30}
            delta={null}
          />
          <GlassStatCardLive
            label="Hospital / system accounts"
            value={formatCount(totals.hospitalAccounts)}
            numericValue={totals.hospitalAccounts}
            delta={null}
          />
        </div>
      </section>

      <div className="pp-ma-grid">
        <section className="glass pp-ma-panel" aria-labelledby="ma-engagement-heading">
          <h2 id="ma-engagement-heading" className="pc-simple-section-title">
            Engagement distribution
          </h2>
          <p className="pc-simple-section-lead mt-1">
            MemberPulse tiers across your full roster—prioritize outreach to at-risk and inactive
            cohorts before renewal season.
          </p>
          <div className="pp-ma-charts mt-6">
            <EngagementTierViz
              tierCounts={data.engagementBreakdown
                .filter((e) => e.count > 0)
                .map((e) => ({
                  tier: e.tier as EngagementTier,
                  count: e.count,
                }))}
              totalActive={totals.all}
            />
            <AnimatedBarList
              rows={data.engagementBreakdown.map((e) => ({
                id: e.tier,
                label: e.label,
                pct: totals.all > 0 ? Math.round((e.count / totals.all) * 100) : 0,
                color: ENGAGEMENT_COLORS[e.tier],
              }))}
            />
          </div>
        </section>

        <section className="glass pp-ma-panel" aria-labelledby="ma-renewal-heading">
          <h2 id="ma-renewal-heading" className="pc-simple-section-title">
            Renewal pipeline
          </h2>
          <p className="pc-simple-section-lead mt-1">
            Finance and member services share one view of who needs renewal outreach.
          </p>
          <ul className="pp-ma-pipeline mt-6">
            {data.renewalPipeline.map((row) => (
              <li key={row.label} className="pp-ma-pipeline-row">
                <span className="pp-ma-pipeline-label">{row.label}</span>
                <span className="pp-ma-pipeline-value tabular-nums">{formatCount(row.count)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${orgSlug}/members/renewals`} className="pc-btn-secondary text-sm">
              Renewal queue →
            </Link>
            <Link href={`/${orgSlug}/members?engagementTier=at_risk`} className="pc-btn-secondary text-sm">
              At-risk directory →
            </Link>
          </div>
        </section>
      </div>

      {data.tierBreakdown.length > 0 ? (
        <section className="glass pp-ma-panel" aria-labelledby="ma-tier-heading">
          <h2 id="ma-tier-heading" className="pc-simple-section-title">
            Dues tiers
          </h2>
          <p className="pc-simple-section-lead mt-1">
            Members assigned to each tier—annualized dues value uses your configured tier pricing.
          </p>
          <div className="pc-table-wrap pp-ma-tier-table mt-4">
            <table className="pc-table w-full">
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col" className="text-right">
                    Members
                  </th>
                  <th scope="col" className="text-right">
                    Annualized dues
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.tierBreakdown.map((t) => (
                  <tr key={t.tierId ?? "none"}>
                    <td>{t.tierName}</td>
                    <td className="text-right tabular-nums">{formatCount(t.count)}</td>
                    <td className="text-right tabular-nums">
                      {t.revenueCents > 0 ? formatUsd(t.revenueCents) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="glass pp-ma-panel" aria-labelledby="ma-governance-heading">
        <h2 id="ma-governance-heading" className="pc-simple-section-title">
          Governance & hospital roster
        </h2>
        <div className="pp-glass-stat-grid mt-4">
          <GlassStatCardLive
            label="C-suite roles (current)"
            value={formatCount(totals.cSuite)}
            numericValue={totals.cSuite}
            delta={null}
          />
          <GlassStatCardLive
            label="Board seats (current)"
            value={formatCount(totals.boardSeats)}
            numericValue={totals.boardSeats}
            delta={null}
          />
          <GlassStatCardLive
            label="On hospital roster"
            value={formatCount(totals.membersOnHospitalRoster)}
            numericValue={totals.membersOnHospitalRoster}
            delta={null}
          />
          <GlassStatCardLive
            label="New joins (30 days)"
            value={formatCount(data.recentJoins30)}
            numericValue={data.recentJoins30}
            delta={null}
          />
        </div>
        {data.topHospitalAccounts.length > 0 ? (
          <div className="pp-ma-hospital-list mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
              Top hospital & health system accounts
            </p>
            <ul className="mt-3 space-y-2">
              {data.topHospitalAccounts.map((h) => (
                <li key={h.id} className="pp-ma-hospital-row">
                  <div>
                    <span className="font-semibold text-[var(--pc-text)]">{h.name}</span>
                    {h.region ? (
                      <span className="ml-2 text-xs text-[var(--pc-text-tertiary)]">
                        {h.region}
                      </span>
                    ) : null}
                  </div>
                  <span className="tabular-nums text-sm text-[var(--pc-text-secondary)]">
                    {formatCount(h.memberCount)} members
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
