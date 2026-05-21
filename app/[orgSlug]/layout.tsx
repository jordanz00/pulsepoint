import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

/** Org segment layout — public event routes skip the admin shell via route groups. */
export default async function OrgSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();
  return <>{children}</>;
}
