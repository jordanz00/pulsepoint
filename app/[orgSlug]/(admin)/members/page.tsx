import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { MemberImportExport } from "@/components/members/member-import-export";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-zinc-600">{members.length} shown (max 200)</p>
        </div>
        <Link
          href={`/${orgSlug}/members/new`}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        >
          Add member
        </Link>
      </div>

      <MemberImportExport />

      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          placeholder="Search name or email"
          defaultValue={q ?? ""}
          className="min-h-11 flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="min-h-11 rounded-lg border border-zinc-300 px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="LAPSED">Lapsed</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/${orgSlug}/members/${m.id}`}
                    className="font-medium text-teal-800 hover:underline"
                  >
                    {m.lastName}, {m.firstName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{m.email ?? "—"}</td>
                <td className="px-4 py-3">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
