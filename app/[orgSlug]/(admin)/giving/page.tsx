import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { CampaignProgress } from "@/components/giving/campaign-progress";
import { GivingPacePanel } from "@/components/giving/giving-pace-panel";
import { moduleCssVars } from "@/lib/module-colors";
import { GivingAdminPanel } from "@/components/giving/giving-admin-panel";
import { GivingExportButton } from "@/components/giving/giving-export-button";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageCapability } from "@/lib/admin-page-guard";
import { loadGivingDashboard } from "@/lib/giving/load-giving";
import { roleAllows } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

export const dynamic = "force-dynamic";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function GivingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requirePageCapability(orgSlug, "giving:read");
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const easy = isEasyAdminMode(orgSlug);
  const canManage = roleAllows("giving:manage", staff.role);
  const campaigns = await loadGivingDashboard(org.id);
  const totalRaised = campaigns.reduce((s, c) => s + c.raisedCents, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const activeCount = activeCampaigns.length;
  const activeGoalCents = activeCampaigns.reduce((s, c) => s + (c.goalCents ?? 0), 0);

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="giving-page">
        <PageHeader
          title="Fundraising"
          subtitle="Campaigns, gifts, and donor export."
          backHref={`/${orgSlug}`}
          backLabel="Home"
          actions={
            <Link href={`/${orgSlug}/give`} className="ds-btn ds-btn--ghost ds-btn--sm">
              Public page
            </Link>
          }
        />

        <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="giving" />

        <div className="giving-hub pp-module-glass-hub">
          <div
            className="mk-mc-preview-kpis mk-mc-preview-kpis--executive pp-module-glass-kpis giving-glass-kpis"
            aria-label="Fundraising summary"
          >
            <div className="mk-mod-glass-kpi" style={moduleCssVars("giving")}>
              <span className="mk-mc-preview-kpi-label">Raised</span>
              <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">{fmtUsd(totalRaised)}</span>
              <span className="mk-mc-preview-kpi-meta">All campaigns · live gifts</span>
            </div>
            <div className="mk-mod-glass-kpi" style={moduleCssVars("commerce")}>
              <span className="mk-mc-preview-kpi-label">Active</span>
              <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">{activeCount}</span>
              <span className="mk-mc-preview-kpi-meta">Open fundraising programs</span>
            </div>
          </div>
          <GivingPacePanel
            raisedCents={totalRaised}
            goalCents={activeGoalCents}
            activeCampaigns={activeCount}
          />
        </div>

        {canManage ? (
          <GivingAdminPanel
            orgSlug={orgSlug}
            campaigns={campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              status: c.status,
            }))}
          />
        ) : null}

        <section className="giving-section" aria-labelledby="giving-campaigns-heading">
          <div className="giving-section__head">
            <h2 id="giving-campaigns-heading" className="giving-section__title">
              Campaigns
            </h2>
            {canManage ? <GivingExportButton orgSlug={orgSlug} /> : null}
          </div>

          {campaigns.length === 0 ? (
            <p className="giving-empty">No campaigns yet.</p>
          ) : (
            <ul className="giving-rows">
              {campaigns.map((c) => (
                <li key={c.id} className="giving-row">
                  <Link href={`/${orgSlug}/giving/${c.id}`} className="giving-row__main">
                    <span className="giving-row__name">{c.name}</span>
                    <span className="giving-row__meta">
                      {c.status.toLowerCase()} · {c.giftCount} gifts
                    </span>
                  </Link>
                  <CampaignProgress
                    variant="glass"
                    raisedCents={c.raisedCents}
                    goalCents={c.goalCents}
                    progressPct={c.progressPct}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminPage>
  );
}
