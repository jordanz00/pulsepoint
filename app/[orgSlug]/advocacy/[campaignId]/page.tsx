import Link from "next/link";
import { notFound } from "next/navigation";
import { TakeActionForm } from "@/components/advocacy/take-action-form";
import {
  loadPublicAdvocacyCampaign,
  loadPublicHospitalOptions,
} from "@/lib/advocacy/load-public-campaign";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function participationPct(responseCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.min(100, Math.round((responseCount / targetCount) * 100));
}

export default async function PublicAdvocacyTakeActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; campaignId: string }>;
  searchParams: Promise<{ thanks?: string }>;
}) {
  const { orgSlug, campaignId } = await params;
  const query = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [campaign, hospitals] = await Promise.all([
    loadPublicAdvocacyCampaign(org.id, campaignId),
    loadPublicHospitalOptions(org.id),
  ]);
  if (!campaign) notFound();

  const target = campaign.targetCount > 0 ? campaign.targetCount : null;
  const pct = target ? participationPct(campaign.responseCount, target) : 0;

  return (
    <main className="giving-public pp-advocacy-public">
      <div className="giving-public__inner giving-public__inner--narrow">
        <p className="giving-public__org">
          <Link href={`/${orgSlug}`}>{org.name}</Link>
        </p>
        <h1 className="giving-public__title">{campaign.name}</h1>
        {campaign.issueTitle ? (
          <p className="giving-public__lead">
            {campaign.issueTitle}
            {campaign.billNumber ? ` · ${campaign.billNumber}` : ""}
            {campaign.jurisdiction ? ` · ${campaign.jurisdiction}` : ""}
          </p>
        ) : (
          <p className="giving-public__lead">
            Record your hospital&apos;s position for association government affairs staff.
          </p>
        )}
        {campaign.issueSummary ? (
          <p className="pp-advocacy-public-summary">{campaign.issueSummary}</p>
        ) : null}

        {target ? (
          <div className="pp-advocacy-public-progress" aria-label="Hospital participation">
            <div className="pp-advocacy-public-progress-head">
              <span>Hospital responses</span>
              <span>
                {campaign.responseCount}/{target} ({pct}%)
              </span>
            </div>
            <div className="mk-mc-preview-facility-track" aria-hidden>
              <span className="mk-mc-preview-facility-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : null}

        {query.thanks === "1" ? (
          <p className="giving-banner giving-banner--ok" role="status">
            Thank you. Your response was recorded.
          </p>
        ) : null}

        <TakeActionForm orgSlug={orgSlug} campaignId={campaign.id} hospitals={hospitals} />
      </div>
    </main>
  );
}
