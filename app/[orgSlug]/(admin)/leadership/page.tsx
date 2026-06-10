import { notFound } from "next/navigation";
import { LeadershipLoopPage } from "@/components/executive/leadership-loop-page";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";

export const metadata = {
  title: "Leadership Loop — PulsePoint",
  description: "Scripted executive briefing: membership, advocacy, workforce, renewals, board pack.",
};

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return <LeadershipLoopPage orgId={org.id} orgSlug={orgSlug} orgName={org.name} />;
}
