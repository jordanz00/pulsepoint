import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { listDuplicateGroups } from "@/app/actions/crm";
import { CONTACT_SOURCE_LABEL } from "@/lib/crm/constants";

export default async function CrmUnifyPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const result = await listDuplicateGroups(orgSlug);
  const groups = result.ok ? result.data.groups : [];
  const sources = result.ok ? result.data.sources : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Unify contacts"
        subtitle="One directory from siloed sources — review duplicates before merging."
        backHref={`/${orgSlug}/crm`}
        backLabel="CRM"
      />

      <div className="pc-glass-panel mb-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">Contact sources</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Every member record tracks where it came from. Imports and web capture add sources automatically.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {sources.length === 0 ? (
            <li className="text-zinc-500">No sources yet — create members or run an import.</li>
          ) : (
            sources.map((s) => (
              <li key={s.kind} className="rounded-full bg-slate-100 px-3 py-1">
                {CONTACT_SOURCE_LABEL[s.kind] ?? s.kind}: {s.count}
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
          <Link href={`/${orgSlug}/members/imports`} className="text-[var(--pc-brand)]">
            Staged CSV import →
          </Link>
          <Link href={`/${orgSlug}/members`} className="text-[var(--pc-brand)]">
            Bulk edit on directory →
          </Link>
        </div>
      </div>

      <div className="pc-glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold">Possible duplicates</h2>
        {groups.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No duplicate groups detected in the current directory.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {groups.map((g) => (
              <li key={g.key} className="rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3">
                <p className="text-sm font-medium text-amber-900">{g.reason}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {g.members.map((m) => (
                    <li key={m.id}>
                      <Link href={`/${orgSlug}/members/${m.id}`} className="text-[var(--pc-brand)]">
                        {m.firstName} {m.lastName}
                      </Link>
                      {m.email ? <span className="text-zinc-500"> · {m.email}</span> : null}
                      {m.sourceCount > 0 ? (
                        <span className="text-zinc-400"> · {m.sourceCount} sources</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}
