import { notFound } from "next/navigation";
import { CeoCommandCenter } from "@/components/executive/ceo-command-center";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";

export const metadata = {
  title: "Executive Command Center — PulsePoint",
  description: "CEO-level briefing: membership, revenue, events, governance, and advocacy.",
};

export default async function CommandCenterPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return <CeoCommandCenter orgId={org.id} orgSlug={orgSlug} orgName={org.name} />;
}
