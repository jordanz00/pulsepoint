import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMemberFormOptions } from "@/lib/member-form-options";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "@/components/members/member-form";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();
  const { tiers, organizations } = await loadMemberFormOptions(org.id);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Add member"
        subtitle={
          easy
            ? "Contact, membership tier, and hospital account in one form."
            : "Full member record—dues tier, renewal date, and hospital roster link."
        }
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
      />
      <MemberForm orgSlug={orgSlug} tiers={tiers} organizations={organizations} />
    </AdminPage>
  );
}
