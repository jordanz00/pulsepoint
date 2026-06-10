import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";
import { AdvocacyBillDeck } from "@/components/advocacy/advocacy-bill-deck";
import { AdvocacyQuickActions } from "@/components/advocacy/advocacy-quick-actions";
import { AdvocacyCampaignBoard } from "@/components/enterprise/advocacy-campaign-os";
import type { AdvocacyCampaignRecord } from "@/lib/advocacy-campaign-ops";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { moduleCssVars } from "@/lib/module-colors";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

function jurisdictionClass(jurisdiction: string): string {
  return jurisdiction.toLowerCase() === "federal"
    ? "mk-adv-preview-jurisdiction mk-adv-preview-jurisdiction--federal"
    : "mk-adv-preview-jurisdiction mk-adv-preview-jurisdiction--state";
}

export default async function AdvocacyPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const [issues, campaigns, stats] = await Promise.all([
    db.advocacyIssue.findMany({
      where: { orgId: org.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    db.advocacyCampaign.findMany({
      where: { orgId: org.id, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { issue: { select: { title: true, billNumber: true, status: true } } },
    }),
    loadAdvocacyDashboardStats(org.id),
  ]);

  const stateIssues = issues.filter((i) => i.jurisdiction.toLowerCase() !== "federal").length;
  const federalIssues = issues.length - stateIssues;
  const launchedCount = campaigns.filter((c) => c.audienceId).length;

  const campaignRecords: AdvocacyCampaignRecord[] = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    audienceId: c.audienceId,
    responseCount: c.responseCount,
    targetCount: c.targetCount,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    createdAt: c.createdAt,
    issue: c.issue,
  }));

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Advocacy & government affairs"
        subtitle="Track issues, launch hospital take-action campaigns, share public response links, and wire outreach through Engage—alpha; legislative feed still roadmap."
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
        actions={
          <>
            <Link href={`/${orgSlug}/engage`} className="pc-btn-secondary">
              Engage
            </Link>
            <Link href={`/${orgSlug}/committees`} className="pc-btn-secondary">
              Committees
            </Link>
          </>
        }
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="advocacy" />

      <div
        className="pp-advocacy-glass pp-topic-card pp-topic-card--engagement glass pp-glass-surface mb-6"
        aria-label="Advocacy summary"
      >
        <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive">
          <div className="mk-mod-glass-kpi" style={moduleCssVars("advocacy")}>
            <span className="mk-mc-preview-kpi-label">Priority issues</span>
            <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">{issues.length}</span>
            <span className="mk-mc-preview-kpi-meta">
              {stateIssues} state · {federalIssues} federal
            </span>
          </div>
          <div className="mk-mod-glass-kpi" style={moduleCssVars("members")}>
            <span className="mk-mc-preview-kpi-label">Hospital accounts</span>
            <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
              {stats.hospitalAccounts}
            </span>
            <span className="mk-mc-preview-kpi-meta">
              {stats.membersOnHospitalRoster.toLocaleString()} contacts on roster
            </span>
          </div>
          <div className="mk-mod-glass-kpi" style={moduleCssVars("engage")}>
            <span className="mk-mc-preview-kpi-label">Hospitals engaged</span>
            <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
              {stats.engagedHospitalAccounts}
            </span>
            <span className="mk-mc-preview-kpi-meta">
              {stats.hospitalEngagementPct}% MemberPulse · {stats.hospitalsWithTakeActionResponse}{" "}
              with take-action responses
            </span>
          </div>
          <div className="mk-mod-glass-kpi" style={moduleCssVars("crm")}>
            <span className="mk-mc-preview-kpi-label">Take-action launched</span>
            <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">{launchedCount}</span>
            <span className="mk-mc-preview-kpi-meta">
              {campaigns.length} active · {stats.emailsSentThisMonth.toLocaleString()} emails MTD
            </span>
          </div>
        </div>
      </div>

      <AdvocacyBillDeck
        issues={issues.map((i) => ({
          id: i.id,
          title: i.title,
          jurisdiction: i.jurisdiction,
          status: i.status,
          billNumber: i.billNumber,
        }))}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6 mt-6">
        <section className="pp-advocacy-panel glass pp-glass-surface p-5">
          <div className="pp-advocacy-panel-head">
            <h2 className="pc-section-title">Policy issues</h2>
            <Link href={`/${orgSlug}/enterprise/organizations`} className="pc-btn-secondary text-sm">
              Hospital accounts
            </Link>
            <Link href={`/${orgSlug}/enterprise/advocacy/issues`} className="pc-btn-secondary text-sm">
              Issue hub
            </Link>
          </div>
          <ul className="mk-adv-preview-issue-list mt-4">
            {issues.map((i) => (
              <li key={i.id}>
                <div className="mk-adv-preview-issue">
                  <span className={jurisdictionClass(i.jurisdiction)}>{i.jurisdiction}</span>
                  <span className="mk-adv-preview-issue-main">
                    <span className="mk-adv-preview-issue-title">{i.title}</span>
                    <span className="mk-adv-preview-issue-meta">
                      {i.status}
                      {i.billNumber ? ` · ${i.billNumber}` : ""}
                    </span>
                  </span>
                </div>
              </li>
            ))}
            {issues.length === 0 ? (
              <li className="pp-advocacy-empty">
                <p>Add your first priority issue below—state and federal bills your hospitals care about.</p>
              </li>
            ) : null}
          </ul>
        </section>

        <section className="pp-advocacy-panel glass pp-glass-surface p-5 lg:col-span-2">
          <div className="pp-advocacy-panel-head">
            <h2 className="pc-section-title">Active campaigns</h2>
            <Link href={`/${orgSlug}/enterprise/advocacy/campaigns`} className="pc-btn-secondary text-sm">
              All campaigns
            </Link>
            <Link href={`/${orgSlug}/engage`} className="pc-btn-secondary text-sm">
              Engage
            </Link>
          </div>
          <div className="mt-4">
            <AdvocacyCampaignBoard orgSlug={orgSlug} campaigns={campaignRecords} />
          </div>
        </section>
      </div>

      <AdvocacyQuickActions
        orgSlug={orgSlug}
        issues={issues.map((i) => ({ id: i.id, title: i.title }))}
        campaigns={campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          audienceId: c.audienceId,
          responseCount: c.responseCount,
          targetCount: c.targetCount,
        }))}
      />
    </AdminPage>
  );
}
