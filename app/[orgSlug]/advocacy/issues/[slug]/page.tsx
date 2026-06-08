import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { getIssueTemplate, issueAreaLabel, type AdvocacyIssueAreaId } from "@/lib/advocacy/issue-templates";
import { AdvocacyIssuePublicShowcase } from "@/components/advocacy/advocacy-issue-public-showcase";

export const dynamic = "force-dynamic";

export default async function PublicAdvocacyIssuePage({
  params,
}: {
  params: Promise<{ orgSlug: string; slug: string }>;
}) {
  const { orgSlug, slug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const issue = await db.advocacyIssue.findFirst({
    where: { orgId: org.id, publicSlug: slug },
  });
  if (!issue) notFound();

  const template = getIssueTemplate(slug);
  const areaLabel = issueAreaLabel(issue.issueArea as AdvocacyIssueAreaId);

  const activeCampaign = await db.advocacyCampaign.findFirst({
    where: { orgId: org.id, issueId: issue.id, isActive: true },
    select: { id: true },
  });

  if (template) {
    return (
      <main className="giving-public pp-advocacy-public">
        <div className="giving-public__inner giving-public__inner--wide">
          <p className="giving-public__org">
            <Link href={`/${orgSlug}`}>{org.name}</Link>
            <span className="text-xs uppercase tracking-wide text-[var(--fg-muted)] ml-2">
              {areaLabel}
            </span>
          </p>
          <AdvocacyIssuePublicShowcase
            orgSlug={orgSlug}
            orgName={org.name}
            issueTitle={issue.title}
            template={template}
            takeActionCampaignId={activeCampaign?.id}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="giving-public pp-advocacy-public">
      <div className="giving-public__inner giving-public__inner--narrow">
        <p className="giving-public__org">
          <Link href={`/${orgSlug}`}>{org.name}</Link>
        </p>
        <p className="text-xs uppercase tracking-wide text-zinc-500">{areaLabel}</p>
        <h1 className="giving-public__title">{issue.title}</h1>
        {issue.summary ? <p className="pp-advocacy-public-summary">{issue.summary}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${orgSlug}/enterprise/advocacy`} className="pc-btn-secondary">
            Association staff login
          </Link>
        </div>
      </div>
    </main>
  );
}
