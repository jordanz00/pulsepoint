import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { CampaignProgress } from "@/components/giving/campaign-progress";
import { GivingExportButton } from "@/components/giving/giving-export-button";
import { CampaignStatusSelect } from "@/components/giving/giving-admin-panel";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageCapability } from "@/lib/admin-page-guard";
import { loadCampaignDetail } from "@/lib/giving/load-giving";
import { roleAllows } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; campaignId: string }>;
}) {
  const { orgSlug, campaignId } = await params;
  const staff = await requirePageCapability(orgSlug, "giving:read");
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const campaign = await loadCampaignDetail(org.id, campaignId);
  if (!campaign) notFound();

  const canManage = roleAllows("giving:manage", staff.role);

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="giving-page">
        <PageHeader
          title={campaign.name}
          subtitle={campaign.description || undefined}
          backHref={`/${orgSlug}/giving`}
          backLabel="Fundraising"
          actions={
            campaign.status === "ACTIVE" ? (
              <Link href={`/${orgSlug}/give/${campaign.id}`} className="ds-btn ds-btn--ghost ds-btn--sm">
                Public page
              </Link>
            ) : undefined
          }
        />

        <CampaignProgress
          raisedCents={campaign.raisedCents}
          goalCents={campaign.goalCents}
          progressPct={campaign.progressPct}
        />

        {canManage ? (
          <div className="giving-detail__status">
            <span className="giving-detail__status-label">Status</span>
            <CampaignStatusSelect
              orgSlug={orgSlug}
              campaignId={campaign.id}
              status={campaign.status}
            />
          </div>
        ) : null}

        <section className="giving-section" aria-labelledby="giving-gifts-heading">
          <div className="giving-section__head">
            <h2 id="giving-gifts-heading" className="giving-section__title">
              Paid gifts
            </h2>
            {canManage ? (
              <GivingExportButton
                orgSlug={orgSlug}
                campaignId={campaign.id}
                campaignSlug={campaign.id}
              />
            ) : null}
          </div>
          {campaign.paidGifts.length === 0 ? (
            <p className="giving-empty">No paid gifts yet.</p>
          ) : (
            <div className="giving-gifts-table-wrap">
              <table className="committee-roster-table">
                <thead>
                  <tr>
                    <th scope="col">Donor</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.paidGifts.map((g) => (
                    <tr key={g.id}>
                      <td>
                        {g.donorName}
                        {g.member ? (
                          <span className="giving-gift-member">
                            {" "}
                            ·{" "}
                            <Link href={`/${orgSlug}/members/${g.member.id}`}>
                              {g.member.firstName} {g.member.lastName}
                            </Link>
                          </span>
                        ) : null}
                      </td>
                      <td>{fmt(g.amountCents)}</td>
                      <td>{g.paidAt ? g.paidAt.toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPage>
  );
}
