import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignProgress } from "@/components/giving/campaign-progress";
import { loadActiveCampaigns } from "@/lib/giving/load-giving";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicGivePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const campaigns = await loadActiveCampaigns(org.id);

  return (
    <main className="giving-public">
      <div className="giving-public__inner">
        <header className="giving-public__head">
          <p className="giving-public__org">{org.name}</p>
          <h1 className="giving-public__title">Give</h1>
          <p className="giving-public__lead">
            Support hospital advocacy, education, and member services.
          </p>
        </header>

        {campaigns.length === 0 ? (
          <p className="giving-empty" role="status">
            No active campaigns right now.
          </p>
        ) : (
          <ul className="giving-rows giving-rows--public" aria-label="Active campaigns">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link href={`/${orgSlug}/give/${c.id}`} className="giving-row giving-row--public">
                  <span className="giving-row__main">
                    <span className="giving-row__name">{c.name}</span>
                    {c.description ? (
                      <span className="giving-row__desc">{c.description}</span>
                    ) : null}
                  </span>
                  <CampaignProgress
                    variant="inline"
                    raisedCents={c.raisedCents}
                    goalCents={c.goalCents}
                    progressPct={c.progressPct}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
