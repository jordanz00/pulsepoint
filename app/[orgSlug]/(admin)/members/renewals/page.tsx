import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { RenewalWorkflowEditor } from "@/components/members/renewal-workflow-editor";
import { RenewalsSummaryPanel } from "@/components/members/renewals-summary-panel";
import { listRenewalsDue } from "@/app/actions/renewals";
import {
  renewalCronStatusLabel,
  summarizeRenewals,
} from "@/lib/renewals/renewals-report";

function fmtCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export default async function MembersRenewalsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const [dueSoon, tiers, workflows] = await Promise.all([
    listRenewalsDue(orgSlug, 90),
    db.memberTier.findMany({
      orderBy: { name: "asc" },
      include: { product: { select: { id: true, name: true, active: true, sku: true } } },
    }),
    db.renewalWorkflow.findMany({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  const workflow = workflows[0];
  const steps = workflow?.steps as
    | { id: string; order: number; type: string; label: string }[]
    | undefined;

  const cron = renewalCronStatusLabel();
  const renewalSummary = summarizeRenewals(
    dueSoon.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      renewalDueAt: m.renewalDueAt,
      tierName: m.tier?.name ?? null,
    })),
  );

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Renewals"
        subtitle="Membership tiers, due dates, and join/renewal workflows"
        badge="alpha"
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
        actions={
          <Link href={`/${orgSlug}/join`} className="pc-btn-secondary" target="_blank" rel="noopener noreferrer">
            Public join page
          </Link>
        }
      />

      <RenewalsSummaryPanel
        orgSlug={orgSlug}
        total={renewalSummary.total}
        overdue={renewalSummary.overdue}
        dueSoon={renewalSummary.dueSoon}
        cronEnabled={cron.enabled}
        cronLabel={cron.label}
        cronHint={cron.hint}
      />

      <section className="pc-card mt-6">
        <h2 className="pc-section-title">Due in 90 days</h2>
        {dueSoon.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">No renewals due soon.</p>
        ) : (
          <ul className="pc-simple-list mt-4">
            {dueSoon.map((m) => (
              <li key={m.id}>
                <Link href={`/${orgSlug}/members/${m.id}`} className="pc-simple-list-link">
                  <span>
                    {m.firstName} {m.lastName}
                    {m.tier ? ` · ${m.tier.name}` : ""}
                  </span>
                  <span className="text-[var(--pc-text-secondary)]">
                    {m.renewalDueAt?.toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pc-card">
        <h2 className="pc-section-title">Membership tiers</h2>
        {tiers.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
            No tiers yet — add products in Commerce, then link them to tiers here.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {tiers.map((t) => (
              <article
                key={t.id}
                className="flex flex-col rounded-2xl border border-[var(--pc-border)] p-5"
              >
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-2xl font-bold text-[var(--pc-brand)]">
                  {fmtCents(t.priceCents)}
                  <span className="text-sm font-normal text-[var(--pc-text-secondary)]">
                    /{t.billingInterval.toLowerCase()}
                  </span>
                </p>
                <ul className="mt-3 flex-1 space-y-1 text-sm text-[var(--pc-text-secondary)]">
                  <li>Member directory access</li>
                  <li>Event member pricing</li>
                  <li>CE transcript (Learn alpha)</li>
                </ul>
                {t.product?.active ? (
                  <Link
                    href={`/${orgSlug}/store?product=${t.product.id}`}
                    className="pc-btn-primary mt-4 text-center text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy {t.product.name} →
                  </Link>
                ) : (
                  <p className="mt-4 text-xs text-[var(--pc-text-tertiary)]">
                    Link an active Commerce product to enable checkout.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <RenewalWorkflowEditor
        orgSlug={orgSlug}
        workflowId={workflow?.id}
        initialName={workflow?.name ?? "Annual renewal"}
        previewHref={`/${orgSlug}/join`}
        initialSteps={
          steps?.map((s) => ({
            id: s.id,
            order: s.order,
            type: s.type as "profile" | "dues" | "terms" | "payment" | "welcome" | "custom",
            label: s.label,
          })) ?? undefined
        }
      />
    </AdminPage>
  );
}
