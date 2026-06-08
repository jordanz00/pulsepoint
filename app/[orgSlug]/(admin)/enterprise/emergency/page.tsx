import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const [contacts, reports] = await Promise.all([
    db.emergencyContact.findMany({
      where: { orgId: org.id },
      include: {
        memberOrganization: { select: { name: true } },
        member: { select: { firstName: true, lastName: true } },
      },
      orderBy: { region: "asc" },
      take: 100,
    }),
    db.emergencyReadinessReport.findMany({
      where: { orgId: org.id },
      orderBy: { reportDate: "desc" },
      take: 20,
    }),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Emergency management"
        subtitle="Hospital emergency contacts and readiness reporting."
        backHref={`/${orgSlug}/enterprise`}
        backLabel="Enterprise AMS"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pc-card p-5">
          <h2 className="pc-section-title">Emergency contacts</h2>
          <ul className="mt-4 divide-y divide-[var(--pc-border)] text-sm">
            {contacts.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-medium">{c.roleTitle}</p>
                <p className="text-zinc-600">
                  {c.memberOrganization?.name ??
                    (c.member ? `${c.member.firstName} ${c.member.lastName}` : "—")}
                </p>
                <p className="text-xs text-zinc-500">
                  {c.region ?? "All regions"} · {c.specialty} · {c.phone}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="pc-card p-5">
          <h2 className="pc-section-title">Readiness reports</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {reports.map((r) => (
              <li key={r.id}>
                Score {r.readinessScore} · {r.reportDate.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}
