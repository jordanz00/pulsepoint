import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignProgress } from "@/components/giving/campaign-progress";
import { DonateForm } from "@/components/giving/donate-form";
import { loadCampaignDetail } from "@/lib/giving/load-giving";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicGiveCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; campaignId: string }>;
  searchParams: Promise<{ thanks?: string; cancelled?: string }>;
}) {
  const { orgSlug, campaignId } = await params;
  const query = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const campaign = await loadCampaignDetail(org.id, campaignId);
  if (!campaign || campaign.status !== "ACTIVE") notFound();

  return (
    <main className="giving-public">
      <div className="giving-public__inner giving-public__inner--narrow">
        <p className="giving-public__org">
          <Link href={`/${orgSlug}/give`}>{org.name}</Link>
        </p>
        <h1 className="giving-public__title">{campaign.name}</h1>
        {campaign.description ? (
          <p className="giving-public__lead">{campaign.description}</p>
        ) : null}

        <CampaignProgress
          raisedCents={campaign.raisedCents}
          goalCents={campaign.goalCents}
          progressPct={campaign.progressPct}
        />

        {query.thanks === "1" ? (
          <p className="giving-banner giving-banner--ok" role="status">
            Thank you. A receipt was sent to your email.
          </p>
        ) : null}
        {query.cancelled === "1" ? (
          <p className="giving-banner" role="status">
            Checkout cancelled. Try again below.
          </p>
        ) : null}

        <DonateForm orgSlug={orgSlug} campaignId={campaign.id} />
      </div>
    </main>
  );
}
