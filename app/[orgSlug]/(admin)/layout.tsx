import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { buildAdminNav } from "@/lib/nav-config";

export default async function OrgAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  let staff;
  try {
    staff = await requireOrgAccessForSlug(orgSlug);
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "UNAUTHORIZED") redirect("/sign-in");
    if (code === "ORG_NOT_FOUND" || code === "NOT_ORG_MEMBER") redirect("/onboarding");
    throw e;
  }

  const org = await prisma.organization.findUnique({
    where: { id: staff.orgId },
  });
  if (!org) redirect("/onboarding");

  const nav = buildAdminNav(orgSlug);

  return (
    <AppShell orgSlug={orgSlug} orgName={org.name} nav={nav}>
      {children}
    </AppShell>
  );
}
