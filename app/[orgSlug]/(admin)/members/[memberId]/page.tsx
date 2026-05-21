import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { MemberForm } from "@/components/members/member-form";
import { DeleteMemberButton } from "@/components/members/delete-member-button";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; memberId: string }>;
}) {
  const { orgSlug, memberId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const member = await db.member.findFirst({ where: { id: memberId } });
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {member.firstName} {member.lastName}
        </h1>
        <DeleteMemberButton orgSlug={orgSlug} memberId={member.id} />
      </div>
      <MemberForm
        orgSlug={orgSlug}
        memberId={member.id}
        initial={{
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email ?? undefined,
          phone: member.phone ?? undefined,
          status: member.status,
          tags: member.tags,
        }}
      />
    </div>
  );
}
