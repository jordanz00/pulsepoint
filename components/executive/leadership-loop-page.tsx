import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { LeadershipLoopPanel } from "@/components/executive/leadership-loop-panel";
import { QuakeMissionControlPanel } from "@/components/executive/quake-mission-control-panel";
import { ExecutiveBriefing } from "@/components/copilot/executive-briefing";
import { HospitalAssociationStrip } from "@/components/enterprise/hospital-association-strip";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";
import { loadAdminModuleStats } from "@/lib/load-admin-module-stats";
import { getOrgDb } from "@/lib/db";
import {
  leadershipLoopTotalMinutes,
  type LeadershipLoopContext,
} from "@/lib/leadership-loop";
import { loadQuakeMissionControl } from "@/lib/quake-mission-control";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function LeadershipLoopPage({
  orgId,
  orgSlug,
  orgName,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
}) {
  const db = getOrgDb(orgId);
  const [ceo, moduleStats, courseCount, exceptionCount, quake] = await Promise.all([
    loadCeoCommandCenter(orgId, orgSlug, orgName),
    loadAdminModuleStats(orgId),
    db.course.count(),
    db.automationException.count({ where: { orgId, resolvedAt: null } }),
    Promise.resolve(loadQuakeMissionControl()),
  ]);

  const loopContext: LeadershipLoopContext = {
    memberTotal: ceo.members.total,
    renewalsDue30: ceo.members.renewalsDue30,
    advocacyActive: ceo.advocacy.activeCount,
    courseCount,
    revenueMtdUsd: fmtUsd(ceo.revenue.mtdCents),
    exceptionCount,
  };

  const asOf = ceo.dataAsOf.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="leadership-page pp-route-enter">
        <div className="leadership-page__hero glass pp-glass-surface">
          <PageHeader
            eyebrow="Leadership loop"
            title={`${orgName} — executive briefing`}
            subtitle={`Scripted ${leadershipLoopTotalMinutes()}-minute path for CEOs and board liaisons. Live stats as of ${asOf}.`}
            badge="live"
            backHref={`/${orgSlug}`}
            backLabel="Home"
            actions={
              <>
                <Link href={`/${orgSlug}/walkthrough?step=0`} className="pc-btn-secondary text-sm">
                  Full guided tour
                </Link>
                <Link href={`/${orgSlug}/command-center`} className="pc-btn-primary text-sm">
                  Command center
                </Link>
              </>
            }
          />
        </div>

        <HospitalAssociationStrip orgId={orgId} orgSlug={orgSlug} variant="compact" />

        <LeadershipLoopPanel orgSlug={orgSlug} context={loopContext} />

        <div className="leadership-page__grid">
          <ExecutiveBriefing orgSlug={orgSlug} variant="home" />
          <QuakeMissionControlPanel data={quake} orgSlug={orgSlug} showOperator />
        </div>

        {moduleStats ? (
          <p className="leadership-page__footnote text-sm text-[var(--pc-text-secondary)]">
            Module stats loaded from tenant database — MemberCore{" "}
            {moduleStats.members ?? "live"}, Advocacy {moduleStats.advocacy ?? "alpha"}.
          </p>
        ) : null}
      </div>
    </AdminPage>
  );
}
