import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Organization profile and platform links" />

      <dl className="pc-table-wrap divide-y text-sm">
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-slate-500">Organization</dt>
          <dd className="col-span-2 font-medium text-slate-900">{org.name}</dd>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-slate-500">Slug</dt>
          <dd className="col-span-2 font-mono text-slate-800">{org.slug}</dd>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-slate-500">Plan</dt>
          <dd className="col-span-2 capitalize">{org.plan}</dd>
        </div>
      </dl>

      <section className="pc-card text-sm text-slate-600">
        <p>
          <strong className="text-slate-800">PulsePoint Commerce</strong> (dues,
          storefronts) is on the roadmap — see{" "}
          <Link href={`/${orgSlug}/commerce`} className="pc-link">
            PulsePoint Commerce
          </Link>
          .
        </p>
        <p className="mt-3">
          Platform subscription placeholder:{" "}
          <Link href="/platform/billing" className="pc-link">
            platform billing
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
