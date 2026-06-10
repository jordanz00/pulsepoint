/**
 * DemoHomeDashboard — executive welcome for easy-admin demo orgs.
 * Single narrative: welcome → KPIs → briefing + revenue → engagement → modules.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { loadDashboardPeriodDeltas } from "@/lib/dashboard-glass";
import { loadOverviewCharts } from "@/lib/overview-dashboard-data";
import { loadInsightsTrends } from "@/lib/insights-trends";
import type { ChartPoint } from "@/lib/motion/chart-samples";
import { revenueLineTopic } from "@/lib/dashboard-topic-colors";
import { GlassDonutChart } from "@/components/charts/glass-donut-chart";
import { DemoQuickExports } from "./demo-quick-exports";
import { MemberEngagementShowcase } from "./member-engagement-showcase";
import { ExecutiveKpiStrip } from "./executive-kpi-strip";
import { ExecutiveBriefing } from "@/components/copilot/executive-briefing";
import { AdminPage } from "@/components/admin/admin-page";
import { HospitalAssociationStrip } from "@/components/enterprise/hospital-association-strip";
import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";
import { loadAdminModuleStats } from "@/lib/load-admin-module-stats";

function fmt(cents: number) {
  if (cents === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type Props = { orgSlug: string };

export async function DemoHomeDashboard({ orgSlug }: Props) {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const [dashboard, periodDeltas, charts, trends] = await Promise.all([
    loadExecutiveDashboard(org.id),
    loadDashboardPeriodDeltas(org.id),
    loadOverviewCharts(org.id),
    loadInsightsTrends(org.id),
  ]);

  const [memberCount, eventCount, upcoming, moduleStats] = await Promise.all([
    db.member.count({ where: { status: "ACTIVE" } }),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 2,
    }),
    loadAdminModuleStats(org.id),
  ]);

  const nonDuesPct =
    dashboard.totalRevenueCents > 0
      ? Math.round((dashboard.nonDuesRevenueCents / dashboard.totalRevenueCents) * 100)
      : 0;
  const duesPct =
    dashboard.totalRevenueCents > 0
      ? Math.round((dashboard.duesRevenueCents / dashboard.totalRevenueCents) * 100)
      : 0;

  const dataAsOf = dashboard.dataAsOf.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const toChartPoints = (metricKey: string): ChartPoint[] | undefined => {
    const trend = trends.find((t) => t.metricKey === metricKey);
    if (trend && trend.points.length > 1) {
      return trend.points.map((p) => ({
        label: p.takenAt.toLocaleDateString(undefined, { month: "short" }),
        value: p.value,
      }));
    }
    return undefined;
  };

  const sparklines: Record<string, ChartPoint[]> = {
    "revenue.total": charts.revenueTrend,
    "members.active": toChartPoints("members.active") ?? charts.revenueTrend.map((p, i) => ({
      ...p,
      value: Math.max(1, memberCount - (charts.revenueTrend.length - 1 - i) * 2),
    })),
    "revenue.non_dues": charts.revenueTrend.map((p) => ({
      label: p.label,
      value: Math.round(p.value * (nonDuesPct / 100)),
    })),
  };

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="pp-demo-home pp-demo-home--v2 pp-route-enter">
        {/* Welcome + headline KPIs — one glass hero, no duplicate headers */}
        <section className="pp-demo-welcome glass pp-glass-surface" aria-labelledby="demo-welcome-title">
          <div className="pp-demo-welcome__top">
            <div className="pp-demo-welcome__copy">
              <p className="pp-eyebrow">Welcome back</p>
              <div className="pp-demo-welcome__title-row">
                <h1 id="demo-welcome-title" className="pp-demo-welcome__title">
                  {org.name}
                </h1>
                <span className="badge-live">Live</span>
              </div>
              <p className="pp-demo-welcome__sub">
                Your association at a glance — built for leadership, no training required.
              </p>
              <p className="pp-demo-welcome__asof">
                <span className="pp-demo-welcome__asof-label">Updated</span> {dataAsOf}
              </p>
            </div>
            <div className="pp-demo-welcome__actions">
              <Link href={`/${orgSlug}/flagship`} className="pc-btn-primary">
                Flagship features
              </Link>
              <Link href={`/${orgSlug}/showcase`} className="pc-btn-secondary">
                Top 20 showcase
              </Link>
              <Link href={`/${orgSlug}/leadership?walkthrough=1`} className="pc-btn-secondary">
                Leadership briefing
              </Link>
              <Link href={`/${orgSlug}/walkthrough?step=0`} className="pc-btn-secondary">
                Take the tour
              </Link>
              <Link href={`/${orgSlug}/command-center`} className="pc-btn-secondary">
                Command center
              </Link>
              <Link href={`/${orgSlug}/insights/board-pack`} className="pc-btn-secondary">
                Board pack
              </Link>
              <Link href={`/${orgSlug}/learn/workforce`} className="pc-btn-secondary">
                Workforce videos
              </Link>
            </div>
          </div>
          <ExecutiveKpiStrip
            kpis={dashboard.kpis}
            deltas={{
              "revenue.total": periodDeltas.revenue,
              "members.active": periodDeltas.members,
              "revenue.non_dues": periodDeltas.nonDuesShare,
            }}
            includeIds={["revenue.total", "members.active", "revenue.non_dues"]}
            sparklines={sparklines}
            hero
          />
        </section>

        {/* Briefing + revenue — bento, no repeated financial section */}
        <div className="pp-demo-bento">
          <div className="pp-demo-bento__main">
            <ExecutiveBriefing orgSlug={orgSlug} variant="home" />
          </div>

          {dashboard.revenueLines.length > 0 ? (
            <aside className="pp-demo-bento__aside glass pp-glass-surface pp-demo-revenue-panel" aria-label="Revenue sources">
              <header className="pp-demo-panel-head">
                <h2 className="pp-demo-panel-title">Revenue sources</h2>
                <p className="pp-demo-panel-sub">Dues, events, and giving on record.</p>
              </header>
              <div className="pp-demo-revenue-panel__mix">
                <GlassDonutChart
                  data={[
                    { name: "Dues", value: duesPct, color: "var(--mod-commerce-fg, #0072bc)" },
                    { name: "Non-dues", value: nonDuesPct, color: "var(--mod-events-fg, #1d9e75)" },
                  ]}
                  height={72}
                  variant="compact"
                  centerLabel="Non-dues"
                  centerValue={`${nonDuesPct}%`}
                  ariaLabel="Dues versus non-dues revenue mix"
                />
              </div>
              <ul className="pp-demo-revenue-panel__list">
                {dashboard.revenueLines.map((line) => {
                  const pct =
                    dashboard.totalRevenueCents > 0
                      ? Math.round((line.amountCents / dashboard.totalRevenueCents) * 100)
                      : 0;
                  const topic = revenueLineTopic(line.id);
                  return (
                    <li key={line.id} className="pp-demo-revenue-panel__row">
                      <span className="pp-demo-revenue-panel__label">
                        <span className={`pp-topic-swatch pp-topic-swatch--${topic}`} aria-hidden />
                        {line.label}
                      </span>
                      <span className="pp-demo-revenue-panel__amount">{fmt(line.amountCents)}</span>
                      <span className="pp-demo-revenue-panel__pct">{pct}%</span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          ) : null}
        </div>

        <HospitalAssociationStrip orgId={org.id} orgSlug={orgSlug} variant="compact" />

        {/* Engagement — single membership block */}
        <section className="pp-demo-engagement-block" aria-labelledby="demo-engagement-heading">
          <header className="pp-demo-panel-head pp-demo-panel-head--inline">
            <div>
              <h2 id="demo-engagement-heading" className="pp-demo-panel-title">
                Member engagement
              </h2>
              <p className="pp-demo-panel-sub">Scores and tiers — who needs a call this week.</p>
            </div>
            <Link href={`/${orgSlug}/members/analytics`} className="pc-link text-sm font-semibold">
              Full analytics →
            </Link>
          </header>
          <MemberEngagementShowcase orgSlug={orgSlug} />
        </section>

        {/* Events + export — compact footer band */}
        <div className="pp-demo-footer-band">
          {upcoming.length > 0 ? (
            <section className="pp-demo-events-compact glass pp-glass-surface" aria-label="Upcoming events">
              <h2 className="pp-demo-panel-title">Upcoming</h2>
              <ul className="pp-demo-events-compact__list">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/${orgSlug}/events/${e.id}`} className="pp-demo-events-compact__row">
                      <time dateTime={e.startsAt.toISOString()} className="pp-demo-events-compact__date">
                        {e.startsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </time>
                      <span className="pp-demo-events-compact__title">{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/${orgSlug}/events`} className="pp-demo-events-compact__all">
                All events ({eventCount}) →
              </Link>
            </section>
          ) : null}

          <DemoQuickExports orgSlug={orgSlug} memberCount={memberCount} variant="inline" />
        </div>

        {/* Platform glance — same interactive briefing as marketing */}
        <section className="pp-demo-glance-suite" aria-labelledby="demo-glance-heading">
          <header className="pp-demo-panel-head pp-demo-panel-head--inline">
            <div>
              <h2 id="demo-glance-heading" className="pp-demo-panel-title">
                PulsePoint at a glance
              </h2>
              <p className="pp-demo-panel-sub">
                Twelve modules, honest Live and Preview labels — tap to explore.
              </p>
            </div>
            <Link href={`/${orgSlug}/suite`} className="pc-btn-secondary text-sm">
              Full suite view
            </Link>
          </header>
          <PlatformGlanceBriefing
            orgSlug={orgSlug}
            moduleStats={moduleStats}
            enabledViews={["platform"]}
          />
        </section>
      </div>
    </AdminPage>
  );
}
