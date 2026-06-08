import Link from "next/link";
import type { ExecutiveDashboard } from "@/lib/executive-metrics";
import { GlassActivityFeed } from "@/components/admin/glass-activity-feed";
import { GlassStatCardLive } from "@/components/admin/glass-stat-card-live";
import { ExecutiveRevenueBars } from "@/components/insights/executive-revenue-bars";
import { kpiTopic } from "@/lib/dashboard-topic-colors";

/** Core widget library for executive insights (Sprint 6). */
export const EXECUTIVE_WIDGET_LIBRARY = [
  { id: "revenue.total", label: "Total revenue", unit: "usd" as const },
  { id: "members.active", label: "Active members", unit: "count" as const },
  { id: "members.at_risk", label: "At-risk members", unit: "count" as const },
  { id: "events.registrations", label: "Event registrations", unit: "count" as const },
  { id: "revenue.dues", label: "Dues revenue", unit: "usd" as const },
  { id: "revenue.non_dues", label: "Non-dues revenue", unit: "usd" as const },
] as const;

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatUsdFromDollars(dollars: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function ExecutiveDashboard({
  data,
  orgSlug,
  compact = false,
}: {
  data: ExecutiveDashboard;
  orgSlug: string;
  compact?: boolean;
}) {
  const primary = data.kpis.filter((k) => k.emphasis === "primary");
  const members = data.kpis.filter((k) => k.group === "members");
  const events = data.kpis.filter((k) => k.group === "events");
  const maxLine = Math.max(...data.revenueLines.map((l) => l.amountCents), 1);
  const kpiById = Object.fromEntries(data.kpis.map((k) => [k.id, k]));

  return (
    <div className="pp-executive-dashboard pp-readable-on-light space-y-8">
      <p className="text-xs text-[var(--readable-on-light-muted)]">
        Data as of {data.dataAsOf.toLocaleString()}
        {compact ? null : " · revenue from dues, events, fundraising, and commerce"}
      </p>

      <section aria-labelledby="exec-revenue-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="exec-revenue-heading" className="pc-simple-section-title">
            Revenue outcomes
          </h2>
          {!compact ? (
            <Link href={`/${orgSlug}/commerce`} className="pc-link text-sm font-semibold">
              Open commerce →
            </Link>
          ) : null}
        </div>
        <div className="pp-glass-stat-grid mt-4" role="list">
          {primary.map((k) => (
            <GlassStatCardLive
              key={k.id}
              label={k.label}
              value={k.unit === "usd" ? formatUsdFromDollars(k.value) : formatCount(k.value)}
              numericValue={k.value}
              prefix={k.unit === "usd" ? "$" : ""}
              decimals={k.unit === "usd" ? 0 : 0}
              delta={null}
              topic={kpiTopic(k.id)}
            />
          ))}
        </div>
        {data.revenueLines.length > 0 ? (
          <div className="pp-executive-breakdown glass pp-glass-surface mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--readable-on-light-muted)]">
              Dues vs non-dues breakdown
            </p>
            <ExecutiveRevenueBars lines={data.revenueLines} maxCents={maxLine} />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="exec-widget-library-heading">
        <h2 id="exec-widget-library-heading" className="pc-simple-section-title">
          Widget library
        </h2>
        <p className="pc-simple-section-lead mt-1">
          Pin the KPIs your board reviews every month — revenue, membership health, and event
          pipeline in one glance.
        </p>
        <div className="pp-executive-secondary-grid mt-4">
          {EXECUTIVE_WIDGET_LIBRARY.map((w) => {
            const kpi = kpiById[w.id];
            const value = kpi?.value ?? 0;
            return (
              <div key={w.id} className="pp-executive-kpi-secondary pp-readable-on-light">
                <p className="text-xs text-[var(--readable-on-light-muted)]">{w.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {w.unit === "usd" ? formatUsdFromDollars(value) : formatCount(value)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="exec-crm-heading">
        <h2 id="exec-crm-heading" className="pc-simple-section-title">
          Member CRM
        </h2>
        <p className="pc-simple-section-lead mt-1">
          Keep every member visible for marketing, renewals, and board reporting—profiles stay in
          sync with revenue activity.
        </p>
        <div className="pp-executive-secondary-grid mt-4">
          {members.map((k) => (
            <div key={k.id} className="pp-executive-kpi-secondary pp-readable-on-light">
              <p className="text-xs text-[var(--readable-on-light-muted)]">{k.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatCount(k.value)}
              </p>
            </div>
          ))}
          {events.map((k) => (
            <div key={k.id} className="pp-executive-kpi-secondary pp-readable-on-light">
              <p className="text-xs text-[var(--readable-on-light-muted)]">{k.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatCount(k.value)}
              </p>
            </div>
          ))}
        </div>
        {!compact ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/${orgSlug}/members`} className="pc-btn-secondary text-sm">
              Member directory
            </Link>
            <Link href={`/${orgSlug}/members/analytics`} className="pc-btn-primary text-sm">
              Membership analytics
            </Link>
            <Link href={`/${orgSlug}/members/renewals`} className="pc-btn-secondary text-sm">
              Renewal queue
            </Link>
            <Link href={`/${orgSlug}/events`} className="pc-btn-secondary text-sm">
              Events
            </Link>
          </div>
        ) : null}
      </section>

      {data.auditTrail.length > 0 ? (
        <section aria-labelledby="exec-audit-heading">
          <h2 id="exec-audit-heading" className="pc-simple-section-title">
            Audit trail
          </h2>
          <p className="pc-simple-section-lead mt-1">
            Staff actions are recorded automatically—exports, publishes, and profile changes.
          </p>
          <div className="mt-4">
            <GlassActivityFeed
              title="Activity"
              items={data.auditTrail.map((row) => ({
                id: row.id,
                summary: row.summary,
                when: row.when,
                kind: row.kind,
              }))}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
