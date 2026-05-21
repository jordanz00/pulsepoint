import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { MemberImportExport } from "@/components/members/member-import-export";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { orgSlug } = await params;
  const { q, status } = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const members = await db.member.findMany({
    where: {
      ...(status && ["ACTIVE", "INACTIVE", "LAPSED"].includes(status)
        ? { status: status as "ACTIVE" | "INACTIVE" | "LAPSED" }
        : {}),
      ...(q?.trim()
        ? {
            OR: [
              { firstName: { contains: q.trim(), mode: "insensitive" } },
              { lastName: { contains: q.trim(), mode: "insensitive" } },
              { email: { contains: q.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
  });
  assertAllRowsBelongToOrg(members, org.id, "members-page");

  return (
    <div className="space-y-6">
      <PageHeader
        title="MemberCore"
        subtitle={`Membership Management · ${members.length} shown (max 200) · staged import with review`}
        badge="live"
        actions={
          <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary text-sm">
            Add member
          </Link>
        }
      />

      <MemberImportExport orgSlug={orgSlug} />

      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          placeholder="Search name or email"
          defaultValue={q ?? ""}
          className="min-h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="LAPSED">Lapsed</option>
        </select>
        <button type="submit" className="pc-btn-secondary text-sm">
          Filter
        </button>
      </form>

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Add a member manually or stage a CSV import for review."
          action={
            <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary text-sm">
              Add member
            </Link>
          }
        />
      ) : (
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link
                      href={`/${orgSlug}/members/${m.id}`}
                      className="pc-link"
                    >
                      {m.lastName}, {m.firstName}
                    </Link>
                  </td>
                  <td className="text-slate-600">{m.email ?? "—"}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
