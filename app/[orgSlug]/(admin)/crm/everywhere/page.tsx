import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { WebCaptureSetup } from "@/components/crm/web-capture-setup";

export default async function CrmEverywherePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Works everywhere"
        subtitle="Add contacts from inbox, LinkedIn, or any webpage — without opening the full admin."
        backHref={`/${orgSlug}/crm`}
        backLabel="CRM"
      />

      <WebCaptureSetup orgId={org.id} orgSlug={orgSlug} />

      <div className="pc-glass-panel mt-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">PulsePoint Prospector</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Full enrichment, business insights, and browser extensions live on the Prospector hub.
        </p>
        <a
          href={`/${orgSlug}/crm/prospector`}
          className="mt-3 inline-block text-sm font-medium text-[var(--pc-brand)]"
        >
          Open Prospector →
        </a>
      </div>

      <div className="pc-glass-panel mt-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">How teams use this</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          <li>
            <strong>Email:</strong> BCC or forward to a future inbox parser — today use the capture API
            from your mail client automation.
          </li>
          <li>
            <strong>LinkedIn:</strong> Paste profile fields into the capture JSON with{" "}
            <code>captureKind: &quot;LINKEDIN&quot;</code>.
          </li>
          <li>
            <strong>Browser:</strong> Bookmarklet or extension calls <code>/api/crm/capture</code> with
            your org token.
          </li>
        </ul>
      </div>
    </AdminPage>
  );
}
