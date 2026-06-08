import { requireOrgAccessForSlug } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { SimplePreviewList } from "@/components/admin/simple-preview-list";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EngageQuickAdd } from "@/components/engage/engage-quick-add";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { ADMIN_PAGES, isEasyAdminMode, pageSubtitle } from "@/lib/admin-page-copy";

export const dynamic = "force-dynamic";

export default async function EngagePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ audienceId?: string }>;
}) {
  const { orgSlug } = await params;
  const { audienceId: highlightAudienceId } = await searchParams;
  const easy = isEasyAdminMode(orgSlug);
  const staff = await requireOrgAccessForSlug(orgSlug);
  const db = getOrgDb(staff.orgId);

  const [templates, audiences, campaigns] = await Promise.all([
    db.emailTemplate.findMany({ orderBy: { createdAt: "desc" }, take: easy ? 15 : 25 }),
    db.emailAudience.findMany({ orderBy: { createdAt: "desc" }, take: easy ? 10 : 25 }),
    db.emailCampaign.findMany({
      include: { template: true, audience: true },
      orderBy: { createdAt: "desc" },
      take: easy ? 10 : 10,
    }),
  ]);

  if (easy) {
    return (
      <AdminPage orgSlug={orgSlug}>
        <PageHeader
          title={ADMIN_PAGES.engage.title}
          subtitle={pageSubtitle(orgSlug, "engage")}
          backHref={`/${orgSlug}`}
          backLabel="Home"
        />
        <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="engage" />
        <h2 className="pc-simple-section-title">Email templates</h2>
        <SimplePreviewList
          items={templates.map((t) => ({
            id: t.id,
            title: t.name,
            detail: t.approved ? "Ready to send" : "Draft",
          }))}
        />
        <h2 className="pc-simple-section-title mt-8">Groups to email</h2>
        <SimplePreviewList
          items={audiences.map((a) => ({
            id: a.id,
            title: a.name,
            detail: a.description?.slice(0, 80) || "Member group",
          }))}
        />
        {campaigns.length > 0 ? (
          <>
            <h2 className="pc-simple-section-title mt-8">Recent sends</h2>
            <SimplePreviewList
              items={campaigns.map((c) => ({
                id: c.id,
                title: c.template.name,
                detail: `${c.audience.name} · ${c.status === "SENT" ? "Sent" : c.status}`,
              }))}
            />
          </>
        ) : null}
      </AdminPage>
    );
  }

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader title="PulsePoint Engage" subtitle={pageSubtitle(orgSlug, "engage")} badge="alpha" />
      <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="engage" />
      <p className="mb-4 text-sm">
        <a href={`/${orgSlug}/engage/sequences`} className="font-medium text-[var(--pc-brand)] hover:underline">
          Email sequences →
        </a>
        <span className="mx-2 text-zinc-400">·</span>
        Multi-step outreach with templates (Nimble-style)
      </p>
      <EngageQuickAdd
        orgSlug={orgSlug}
        templates={templates.filter((t) => t.approved)}
        audiences={audiences}
        defaultAudienceId={
          highlightAudienceId && audiences.some((a) => a.id === highlightAudienceId)
            ? highlightAudienceId
            : undefined
        }
      />
      <section>
        <h2 className="pc-simple-section-title mb-3">Templates ({templates.length})</h2>
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    {t.approved ? <Badge variant="live">Yes</Badge> : <Badge variant="roadmap">No</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPage>
  );
}
