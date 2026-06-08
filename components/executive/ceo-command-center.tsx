import Link from "next/link";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";
import { CeoKpiCard } from "@/components/executive/ceo-kpi-card";
import { CeoChartsPanel } from "@/components/executive/ceo-charts-panel";
import { CeoReviewQueue } from "@/components/executive/ceo-review-queue";
import {
  CeoAdvocacyPanel,
  CeoCommitteesPanel,
  CeoEventsPanel,
} from "@/components/executive/ceo-domain-panels";
import { PlatformGlanceCompact } from "@/components/platform/platform-glance-compact";
import { ExecutiveBriefing } from "@/components/copilot/executive-briefing";
import { HospitalAssociationStrip } from "@/components/enterprise/hospital-association-strip";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import type { PeriodDelta } from "@/lib/dashboard-glass";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function memberGrowthDelta(delta: number): PeriodDelta {
  if (delta === 0) return { label: "Flat vs last month", direction: "flat" };
  const sign = delta > 0 ? "+" : "";
  return { label: `${sign}${delta} net vs last month`, direction: delta > 0 ? "up" : "down" };
}

function revenueDelta(pct: number | null): PeriodDelta | null {
  if (pct === null) return null;
  if (pct === 0) return { label: "Flat vs last month", direction: "flat" };
  return {
    label: `${pct > 0 ? "+" : ""}${pct}% vs last month`,
    direction: pct > 0 ? "up" : "down",
  };
}

export async function CeoCommandCenter({
  orgId,
  orgSlug,
  orgName,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
}) {
  const data = await loadCeoCommandCenter(orgId, orgSlug, orgName);
  const asOf = data.dataAsOf.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const reviewCount = data.executiveReview.filter((r) => r.priority !== "low").length;

  return (
    <AdminPage orgSlug={orgSlug}>
    <div className="ceo-command-center pp-route-enter">
      <div className="ceo-command-center__hero glass pp-glass-surface">
        <PageHeader
          eyebrow="Executive command center"
          title={orgName}
          subtitle={`One-screen leadership briefing — membership, revenue, events, governance, and advocacy. Data as of ${asOf}.`}
          badge="live"
          backHref={`/${orgSlug}`}
          backLabel="Home"
          actions={
            <>
              <Link href={`/${orgSlug}/insights/board-pack`} className="pc-btn-secondary text-sm">
                Board pack
              </Link>
              <Link href={`/${orgSlug}/insights`} className="pc-btn-secondary text-sm">
                Insights
              </Link>
              <Link href={`/${orgSlug}/members`} className="pc-btn-primary text-sm">
                Member directory
              </Link>
            </>
          }
        />
      </div>

      <PlatformGlanceCompact orgSlug={orgSlug} />

      <section className="ceo-kpi-strip" aria-label="Executive KPIs">
        <CeoKpiCard
          eyebrow="Members"
          value={data.members.total.toLocaleString()}
          numericValue={data.members.total}
          meaning="Active members in MemberCore"
          delta={memberGrowthDelta(data.members.growthDelta)}
        />
        <CeoKpiCard
          eyebrow="Growth"
          value={String(data.members.joinedThisMonth)}
          numericValue={data.members.joinedThisMonth}
          meaning="New members joined this month"
          delta={{
            label: `${data.members.growthDelta >= 0 ? "+" : ""}${data.members.growthDelta} vs prior month`,
            direction:
              data.members.growthDelta > 0 ? "up" : data.members.growthDelta < 0 ? "down" : "flat",
          }}
        />
        <CeoKpiCard
          eyebrow="Revenue"
          value={fmtUsd(data.revenue.mtdCents)}
          numericValue={Math.round(data.revenue.mtdCents / 100)}
          prefix="$"
          meaning="Month-to-date recorded revenue"
          delta={revenueDelta(data.revenue.deltaPct)}
        />
        <CeoKpiCard
          eyebrow="Revenue at risk"
          value={String(data.revenue.atRiskMemberCount)}
          numericValue={data.revenue.atRiskMemberCount}
          meaning="Renewals due, at-risk, and lapsed members"
          delta={
            data.revenue.atRiskMemberCount > 0
              ? { label: "Executive review recommended", direction: "down" }
              : { label: "No elevated risk", direction: "up" }
          }
        />
      </section>

      <HospitalAssociationStrip orgId={orgId} orgSlug={orgSlug} variant="full" />

      <div className="ceo-command-center__main">
        <div className="ceo-command-center__charts">
          <CeoChartsPanel
            membershipTrend={data.members.trend}
            revenueTrend={data.revenue.trend}
            revenueMtd={data.revenue.mtdCents}
            revenueDeltaPct={data.revenue.deltaPct}
            duesPct={data.revenue.duesPct}
            nonDuesPct={data.revenue.nonDuesPct}
          />
        </div>
        <aside className="ceo-command-center__aside">
          <CeoReviewQueue items={data.executiveReview} />
          {reviewCount > 0 ? (
            <p className="ceo-command-center__aside-note">
              {reviewCount} item{reviewCount === 1 ? "" : "s"} flagged for leadership review.
            </p>
          ) : null}
        </aside>
      </div>

      <section className="ceo-domain-grid" aria-label="Domain summaries">
        <CeoEventsPanel
          orgSlug={orgSlug}
          upcoming={data.events.upcoming}
          highlights={data.events.highlights}
        />
        <CeoCommitteesPanel
          orgSlug={orgSlug}
          total={data.committees.total}
          alerts={data.committees.alerts}
        />
        <CeoAdvocacyPanel
          orgSlug={orgSlug}
          activeCount={data.advocacy.activeCount}
          issues={data.advocacy.issues}
        />
      </section>

      <div className="ceo-command-center__briefing">
        <ExecutiveBriefing orgSlug={orgSlug} />
      </div>
    </div>
    </AdminPage>
  );
}
