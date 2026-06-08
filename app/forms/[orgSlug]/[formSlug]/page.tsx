import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseWebFormFields } from "@/lib/crm/web-form-fields";
import { PublicWebForm } from "@/components/crm/public-web-form";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ orgSlug: string; formSlug: string }>;
}) {
  const { orgSlug, formSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const form = await prisma.webForm.findFirst({
    where: { orgId: org.id, slug: formSlug, published: true },
  });
  if (!form) notFound();

  const fields = parseWebFormFields(form.fields);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">{form.name}</h1>
      {form.description ? <p className="mt-2 text-sm text-zinc-600">{form.description}</p> : null}
      <PublicWebForm orgSlug={orgSlug} formSlug={formSlug} fields={fields} />
    </main>
  );
}
