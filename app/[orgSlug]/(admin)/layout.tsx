import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DemoExperienceShell } from "@/components/demo-experience-shell";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getAdminNavCounts } from "@/lib/admin-nav-counts";
import { getOrgDb } from "@/lib/db";
import { buildAdminNav } from "@/lib/nav-config";
import { authRedirectPath, isStandalonePrototype } from "@/lib/standalone-prototype";

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
    if (code === "UNAUTHORIZED") redirect(authRedirectPath());
    if (code === "ORG_NOT_FOUND" || code === "NOT_ORG_MEMBER") redirect("/onboarding");
    throw e;
  }

  const org = await prisma.organization.findUnique({
    where: { id: staff.orgId },
  });
  if (!org) redirect("/onboarding");

  const db = getOrgDb(staff.orgId);
  const [nav, navCounts, exceptionPreview] = await Promise.all([
    Promise.resolve(buildAdminNav(orgSlug)),
    getAdminNavCounts(staff.orgId),
    db.automationException.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, message: true, createdAt: true },
    }),
  ]);

  return (
    <AppShell
      orgSlug={orgSlug}
      orgName={org.name}
      orgLogoUrl={null}
      nav={nav}
      navCounts={navCounts}
      standalone={isStandalonePrototype()}
      exceptionPreview={exceptionPreview.map((e) => ({
        id: e.id,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
      }))}
    >
      <DemoExperienceShell orgSlug={orgSlug}>{children}</DemoExperienceShell>
    </AppShell>
  );
}
