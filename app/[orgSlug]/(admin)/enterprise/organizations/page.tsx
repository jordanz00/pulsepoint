import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";

export default async function MemberOrganizationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const accounts = await db.memberOrganization.findMany({
    where: { orgId: org.id },
    include: {
      parent: { select: { name: true } },
      _count: { select: { members: true, children: true } },
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Hospital & health system accounts"
        subtitle="Parent-child hierarchy, roster rollups, and membership analytics."
        backHref={`/${orgSlug}/enterprise`}
        backLabel="Enterprise AMS"
        actions={
          <Link href={`/${orgSlug}/enterprise/organizations/new`} className="pc-btn-primary">
            Add account
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Link href={`/${orgSlug}/members/analytics`} className="pc-btn-secondary text-sm">
          Membership analytics →
        </Link>
      </div>

      <div className="pc-table-wrap mt-4">
        <table className="pc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Region</th>
              <th>Members</th>
              <th>Subsidiaries</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td>{a.type.replace(/_/g, " ")}</td>
                <td>{a.parent?.name ?? "—"}</td>
                <td>{a.region ?? "—"}</td>
                <td className="tabular-nums">{a._count.members}</td>
                <td className="tabular-nums">{a._count.children}</td>
                <td>
                  <Link
                    href={`/${orgSlug}/enterprise/organizations/${a.id}`}
                    className="pc-link text-sm font-semibold"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {accounts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No organizational accounts yet.{" "}
          <Link href={`/${orgSlug}/enterprise/organizations/new`} className="pc-link">
            Add your first hospital account
          </Link>{" "}
          or run demo seed.
        </p>
      ) : null}
    </AdminPage>
  );
}
