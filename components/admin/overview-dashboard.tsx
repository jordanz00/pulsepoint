import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPage } from "@/components/admin/admin-page";
import { GlassStatCardLive } from "@/components/admin/glass-stat-card-live";
import { OverviewChartsPanel } from "@/components/admin/overview-charts-panel";
import { OverviewQuickLinks } from "@/components/admin/overview-quick-links";
import { InsightsFeed } from "@/components/intelligence/insights-feed";
import { PageHeader } from "@/components/ui/page-header";
import { PilotSetupChecklist } from "@/components/admin/pilot-setup-checklist";
import { HospitalAssociationStrip } from "@/components/enterprise/hospital-association-strip";
import { PlatformGlanceCompact } from "@/components/platform/platform-glance-compact";
import { loadOverviewDashboard } from "@/lib/overview-dashboard-data";
import { loadPilotSetupChecklist } from "@/lib/onboarding/pilot-setup-checklist";
import type { PeriodDelta } from "@/lib/dashboard-glass";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function memberDelta(delta: number): PeriodDelta | null {
  if (delta === 0) return { label: "No change this month", direction: "flat" };
  const sign = delta > 0 ? "+" : "";
  return {
    label: `${sign}${delta} this month`,
    direction: delta > 0 ? "up" : "down",
  };
}

function revenueDelta(pct: number | null): PeriodDelta | null {
  if (pct === null) return null;
  if (pct === 0) return { label: "No change vs last month", direction: "flat" };
  return {
    label: `${pct > 0 ? "+" : ""}${pct}% vs last month`,
    direction: pct > 0 ? "up" : "down",
  };
}

export async function OverviewDashboard({
  orgSlug,
  orgName,
}: {
  orgSlug: string;
  orgName: string;
}) {
  const org = await import("@/lib/prisma").then((m) =>
    m.prisma.organization.findUnique({ where: { slug: orgSlug } }),
  );
  if (!org) return null;

  const [{ stats, charts }, pilotChecklist] = await Promise.all([
    loadOverviewDashboard(org.id),
    loadPilotSetupChecklist(org.id, orgSlug),
  ]);

  const atRiskDelta: PeriodDelta =
    stats.atRiskMembers > 0
      ? { label: "Review in directory", direction: "down" }
      : { label: "All engaged", direction: "up" };

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="overview-home pp-route-enter">
        <PageHeader
          title={`${greeting()}, ${orgName}`}
          subtitle="Membership, revenue, and what needs attention today."
          actions={
            <Link href={`/${orgSlug}/members/new`} className="ds-btn ds-btn--primary">
              <Plus size={16} aria-hidden />
              Add member
            </Link>
          }
        />

        <PlatformGlanceCompact orgSlug={orgSlug} />

        <PilotSetupChecklist checklist={pilotChecklist} />

        <section className="overview-home__kpis" aria-label="Key metrics">
          <div className="overview-home__stat-row" role="list">
            <GlassStatCardLive
              label="Members"
              value={stats.membersTotal.toLocaleString()}
              numericValue={stats.membersTotal}
              delta={memberDelta(stats.membersDelta)}
            />
            <GlassStatCardLive
              label="Events"
              value={String(stats.eventsTotal)}
              numericValue={stats.eventsTotal}
              delta={{
                label: `${stats.upcomingEvents} upcoming`,
                direction: "flat",
              }}
            />
            <GlassStatCardLive
              label="Revenue (MTD)"
              value={fmtUsd(stats.revenueMtdCents)}
              numericValue={Math.round(stats.revenueMtdCents / 100)}
              prefix="$"
              delta={revenueDelta(stats.revenueDeltaPct)}
            />
            <GlassStatCardLive
              label="At-risk members"
              value={String(stats.atRiskMembers)}
              numericValue={stats.atRiskMembers}
              delta={atRiskDelta}
            />
          </div>
        </section>

        <HospitalAssociationStrip orgId={org.id} orgSlug={orgSlug} variant="compact" />

        <section className="overview-home__intel" aria-label="Recommended actions">
          <InsightsFeed
            orgSlug={orgSlug}
            limit={2}
            showHeader={false}
            showViewAll
            variant="teaser"
          />
        </section>

        <section className="overview-home__charts" aria-label="Revenue overview">
          <OverviewChartsPanel
            revenueTrend={charts.revenueTrend}
            duesPct={charts.duesPct}
            nonDuesPct={charts.nonDuesPct}
          />
        </section>

        <OverviewQuickLinks orgSlug={orgSlug} />

        <p className="overview-home__suite-link">
          <Link href={`/${orgSlug}/suite`} className="pc-link font-semibold">
            Open full suite briefing →
          </Link>
        </p>
      </div>
    </AdminPage>
  );
}
