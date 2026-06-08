import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { WebFormCreate } from "@/components/crm/web-form-create";
import { WebFormRowActions } from "@/components/crm/web-form-row-actions";
import { ensureDefaultLeadCaptureForm, listWebForms } from "@/app/actions/web-forms";

export const dynamic = "force-dynamic";

export default async function CrmWebFormsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultLeadCaptureForm(orgSlug);
  const res = await listWebForms(orgSlug);
  const forms = res.ok ? res.data : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Web forms"
        subtitle="Hosted lead capture with automatic thank-you email and CRM workflow enrollment."
        badge="alpha"
        backHref={`/${orgSlug}/crm`}
        backLabel="CRM"
      />

      <WebFormCreate orgSlug={orgSlug} />

      <section className="mt-8">
        <h2 className="pc-simple-section-title mb-3">Forms ({forms.length})</h2>
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Submissions</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td className="font-mono text-xs">{f.slug}</td>
                  <td>{f._count.submissions}</td>
                  <td>{f.published ? "Published" : "Draft"}</td>
                  <td>
                    <WebFormRowActions
                      orgSlug={orgSlug}
                      formId={f.id}
                      published={f.published}
                      publicPath={`/forms/${orgSlug}/${f.slug}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          API: <code className="text-xs">POST /api/public/forms/{orgSlug}/[slug]</code>
        </p>
      </section>
    </AdminPage>
  );
}
