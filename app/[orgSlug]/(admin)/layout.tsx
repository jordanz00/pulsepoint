import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function OrgAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (session.orgSlug && session.orgSlug !== orgSlug) {
    redirect(`/${session.orgSlug}`);
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) redirect("/onboarding");

  const nav = [
    { href: `/${orgSlug}`, label: "Overview" },
    { href: `/${orgSlug}/members`, label: "Members" },
    { href: `/${orgSlug}/events`, label: "Events" },
    { href: `/${orgSlug}/portal`, label: "Member portal" },
    { href: `/${orgSlug}/settings`, label: "Settings" },
  ];

  return (
    <AppShell orgSlug={orgSlug} orgName={org.name} nav={nav}>
      {children}
    </AppShell>
  );
}
