import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { SequenceTemplatePicker } from "@/components/engage/sequence-template-picker";
import { SequenceActivateButton } from "@/components/engage/sequence-list-actions";
import {
  ensureDemoEmailSequences,
  listEmailSequences,
} from "@/app/actions/email-sequences";

export const dynamic = "force-dynamic";

export default async function EmailSequencesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDemoEmailSequences(orgSlug);
  const res = await listEmailSequences(orgSlug);
  const sequences = res.ok ? res.data : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Email sequences"
        subtitle="Multi-step outreach from your domain — time-based steps inspired by Nimble Email Sequences."
        badge="alpha"
        backHref={`/${orgSlug}/engage`}
        backLabel="Engage"
      />

      <SequenceTemplatePicker orgSlug={orgSlug} />

      <section className="mt-8">
        <h2 className="pc-simple-section-title mb-3">Your sequences ({sequences.length})</h2>
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Steps</th>
                <th>Enrollments</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sequences.map((s) => (
                <tr key={s.id}>
                  <td>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.description}</p>
                  </td>
                  <td>{s.status}</td>
                  <td>{s.steps.length}</td>
                  <td>{s._count.enrollments}</td>
                  <td>
                    <SequenceActivateButton orgSlug={orgSlug} sequenceId={s.id} status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPage>
  );
}
