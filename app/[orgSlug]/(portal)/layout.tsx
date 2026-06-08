import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalNav } from "@/components/portal/portal-nav";
import { PortalClerkBar } from "@/components/portal/portal-clerk-bar";
import { requirePortalSession } from "@/lib/auth";
import { authRedirectPath } from "@/lib/standalone-prototype";
import { prisma } from "@/lib/prisma";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  try {
    await requirePortalSession(orgSlug);
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "UNAUTHORIZED" || code === "ORG_MISMATCH") {
      redirect(authRedirectPath());
    }
    throw e;
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) redirect("/");

  return (
    <div className="portal-shell pp-canvas min-h-screen">
      <header className="portal-header">
        <div className="portal-header__inner">
          <Link href={`/${orgSlug}/portal`} className="portal-header__brand">
            <span className="portal-header__org">{org.name}</span>
            <span className="portal-header__tag">Member portal</span>
          </Link>
          <div className="portal-header__actions">
            <PortalNav orgSlug={orgSlug} />
            <PortalClerkBar />
          </div>
        </div>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
