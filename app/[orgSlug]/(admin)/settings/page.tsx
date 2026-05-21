import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
      <h1 className="text-2xl font-bold">Settings</h1>
      <dl className="divide-y rounded-xl border bg-white text-sm">
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-zinc-500">Organization</dt>
          <dd className="col-span-2 font-medium">{org.name}</dd>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-zinc-500">Slug</dt>
          <dd className="col-span-2 font-mono">{org.slug}</dd>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-zinc-500">Plan</dt>
          <dd className="col-span-2">{org.plan}</dd>
        </div>
      </dl>
      <p className="text-sm text-zinc-600">
        Platform billing (PulseCore subscription) is configured in{" "}
        <Link href="/platform/billing" className="text-teal-700 underline">
          platform billing
        </Link>
        .
      </p>
    </div>
  );
}
