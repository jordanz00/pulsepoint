import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import {
  ASSOCIATION_DEPARTMENTS,
  type AssociationDepartmentId,
  ENTERPRISE_MODULES,
} from "@/lib/association";

export default async function EnterpriseDepartmentPage({
  params,
}: {
  params: Promise<{ orgSlug: string; departmentId: string }>;
}) {
  const { orgSlug, departmentId } = await params;
  const dept = ASSOCIATION_DEPARTMENTS[departmentId as AssociationDepartmentId];
  if (!dept) notFound();

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const modules = ENTERPRISE_MODULES.filter((m) => m.departments.includes(dept.id));

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={dept.name}
        subtitle={dept.description}
        backHref={`/${orgSlug}/enterprise`}
        backLabel="Enterprise AMS"
      />
      <div className="space-y-6">
        <section className="pc-card p-5">
          <h2 className="pc-section-title">PulsePoint modules</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {dept.productModules.map((p) => (
              <li key={p}>
                <Link href={`/${orgSlug}/${p === "advocacy_issues" ? "enterprise/advocacy" : p}`} className="pc-btn-secondary text-sm">
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="pc-card p-5">
          <h2 className="pc-section-title">Requirement coverage</h2>
          <ul className="mt-4 space-y-3">
            {modules.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium">{m.title}</span>
                <span className="ml-2 text-xs uppercase text-zinc-400">{m.phase}</span>
                <p className="text-zinc-600">{m.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}
