import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { OrganizationForm } from "@/components/enterprise/organization-form";
import { DeleteOrganizationButton } from "@/components/enterprise/delete-organization-button";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; accountId: string }>;
}) {
  const { orgSlug, accountId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const account = await db.memberOrganization.findFirst({
    where: { id: accountId, orgId: org.id },
    include: {
      parent: { select: { name: true } },
      children: { orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } },
      members: {
        take: 25,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true, jobTitle: true, status: true },
      },
      _count: { select: { members: true } },
    },
  });
  if (!account) notFound();

  const parents = await db.memberOrganization.findMany({
    where: { orgId: org.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={account.name}
        subtitle={`${account.type.replace(/_/g, " ")} · ${account._count.members} members on roster`}
        backHref={`/${orgSlug}/enterprise/organizations`}
        backLabel="Hospital accounts"
        badge="live"
      />

      <div className="pp-org-detail-grid">
        <section className="glass pp-org-detail-panel">
          <h2 className="pc-simple-section-title">Account details</h2>
          <OrganizationForm
            orgSlug={orgSlug}
            accountId={account.id}
            parentOptions={parents}
            initial={{
              name: account.name,
              type: account.type,
              parentId: account.parentId ?? undefined,
              region: account.region ?? undefined,
              bedCount: account.bedCount,
              ownership: account.ownership ?? "",
              membershipLevel: account.membershipLevel ?? undefined,
              participationLevel: account.participationLevel ?? undefined,
            }}
          />
          <div className="mt-6 border-t border-[var(--pc-border)] pt-6">
            <DeleteOrganizationButton
              orgSlug={orgSlug}
              accountId={account.id}
              accountName={account.name}
            />
          </div>
        </section>

        <section className="glass pp-org-detail-panel">
          <h2 className="pc-simple-section-title">Members on roster</h2>
          {account.members.length === 0 ? (
            <p className="text-sm text-[var(--pc-text-secondary)]">
              No members linked yet. Assign hospital account on member profiles.
            </p>
          ) : (
            <ul className="pp-org-member-list">
              {account.members.map((m) => (
                <li key={m.id}>
                  <Link href={`/${orgSlug}/members/${m.id}`} className="pc-link font-medium">
                    {m.firstName} {m.lastName}
                  </Link>
                  <span className="text-xs text-[var(--pc-text-tertiary)]">
                    {m.jobTitle ?? m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/${orgSlug}/members`} className="pc-btn-secondary mt-4 inline-block text-sm">
            Member directory →
          </Link>
        </section>

        {account.children.length > 0 ? (
          <section className="glass pp-org-detail-panel pp-org-detail-span">
            <h2 className="pc-simple-section-title">Subsidiary accounts</h2>
            <ul className="pp-org-subsidiary-list">
              {account.children.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${orgSlug}/enterprise/organizations/${c.id}`}
                    className="font-semibold text-[var(--pc-text)]"
                  >
                    {c.name}
                  </Link>
                  <span className="text-sm text-[var(--pc-text-tertiary)]">
                    {c._count.members} members
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AdminPage>
  );
}
