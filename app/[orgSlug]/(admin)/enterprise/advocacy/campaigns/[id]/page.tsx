import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import {
  AdvocacyCampaignOpsBrief,
  AdvocacyCampaignStatusBadge,
  AdvocacyCampaignWorkflow,
} from "@/components/enterprise/advocacy-campaign-os";
import { AdvocacyCampaignWorkflowActions } from "@/components/enterprise/advocacy-campaign-workflow-actions";
import {
  buildAdvocacyCampaignOpsCards,
  participationPct,
  type AdvocacyCampaignRecord,
} from "@/lib/advocacy-campaign-ops";
import { moduleCssVars } from "@/lib/module-colors";

export default async function AdvocacyCampaignDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [campaign, recentResponseCount, recentResponses] = await Promise.all([
    db.advocacyCampaign.findUnique({
      where: { id },
      include: { issue: { select: { title: true, billNumber: true, status: true } } },
    }),
    db.advocacyCampaignResponse.count({
      where: { orgId: org.id, campaignId: id, createdAt: { gte: weekAgo } },
    }),
    db.advocacyCampaignResponse.findMany({
      where: { orgId: org.id, campaignId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        hospitalName: true,
        responderName: true,
        position: true,
        createdAt: true,
      },
    }),
  ]);

  if (!campaign || campaign.orgId !== org.id) notFound();

  const record: AdvocacyCampaignRecord = {
    id: campaign.id,
    name: campaign.name,
    isActive: campaign.isActive,
    audienceId: campaign.audienceId,
    responseCount: campaign.responseCount,
    targetCount: campaign.targetCount,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    createdAt: campaign.createdAt,
    issue: campaign.issue,
  };

  const target = campaign.targetCount > 0 ? campaign.targetCount : null;
  const pct = target ? participationPct(campaign.responseCount, target) : 0;
  const opsCards = buildAdvocacyCampaignOpsCards(record, recentResponseCount);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={campaign.name}
        subtitle={
          campaign.issue
            ? `${campaign.issue.title}${campaign.issue.billNumber ? ` · ${campaign.issue.billNumber}` : ""} · ${campaign.issue.status}`
            : "Hospital take-action campaign"
        }
        badge="alpha"
        backHref={`/${orgSlug}/enterprise/advocacy/campaigns`}
        backLabel="Campaigns"
        actions={<AdvocacyCampaignStatusBadge campaign={record} />}
      />

      <AdvocacyCampaignOpsBrief cards={opsCards} />

      <div className="pp-campaign-os__detail-grid">
        <section
          className="pp-campaign-os__kpis glass pp-glass-surface"
          aria-label="Campaign metrics"
          style={moduleCssVars("advocacy")}
        >
          <div className="pp-campaign-os__kpi">
            <span className="pp-campaign-os__kpi-label">Hospital responses</span>
            <span className="pp-campaign-os__kpi-value">
              {campaign.responseCount}
              {target ? ` / ${target}` : ""}
            </span>
            {target ? <span className="pp-campaign-os__kpi-meta">{pct}% participation</span> : null}
          </div>
          <div className="pp-campaign-os__kpi">
            <span className="pp-campaign-os__kpi-label">Recent activity</span>
            <span className="pp-campaign-os__kpi-value">{recentResponseCount}</span>
            <span className="pp-campaign-os__kpi-meta">responses in last 7 days</span>
          </div>
          <div className="pp-campaign-os__kpi">
            <span className="pp-campaign-os__kpi-label">Engage audience</span>
            <span className="pp-campaign-os__kpi-value">{campaign.audienceId ? "Linked" : "—"}</span>
            <span className="pp-campaign-os__kpi-meta">
              {campaign.audienceId ? "Outreach wired" : "Launch take-action to create"}
            </span>
          </div>
        </section>

        <section className="pp-campaign-os__timeline glass pp-glass-surface">
          <h2 className="pc-section-title">State transitions</h2>
          <AdvocacyCampaignWorkflow campaign={record} />
        </section>
      </div>

      <AdvocacyCampaignWorkflowActions orgSlug={orgSlug} campaign={record} />

      <section className="pp-campaign-os__responses glass pp-glass-surface">
        <div className="pp-campaign-os__responses-head">
          <h2 className="pc-section-title">Recent hospital responses</h2>
          <Link href={`/${orgSlug}/audit`} className="pc-btn-secondary text-sm">
            Audit trail
          </Link>
        </div>
        {recentResponses.length === 0 ? (
          <p className="pp-campaign-os__responses-empty">
            No recorded responses yet — share the public take-action link with member hospitals.
          </p>
        ) : (
          <ul className="pp-campaign-os__response-list">
            {recentResponses.map((r) => (
              <li key={r.id} className="pp-campaign-os__response-row">
                <span className="pp-campaign-os__response-hospital">{r.hospitalName}</span>
                <span className="pp-campaign-os__response-person">
                  {r.responderName} · {r.position.toLowerCase()}
                </span>
                <time className="pp-campaign-os__response-time" dateTime={r.createdAt.toISOString()}>
                  {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
