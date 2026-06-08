import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { ADMIN_PAGES, isEasyAdminMode, pageSubtitle } from "@/lib/admin-page-copy";
import { roleAllows } from "@/lib/permissions";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;
  const canManageStaff = roleAllows("org:settings", staff.role);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.settings.title}
        subtitle={pageSubtitle(orgSlug, "settings")}
        backHref={easy ? `/${orgSlug}` : undefined}
        backLabel="Home"
      />

      <Card padding="none" className="overflow-hidden">
        <ul className="pc-simple-list m-0">
          <li className="px-6 py-5">
            <p className="ds-label m-0 normal-case tracking-normal">Organization</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-[var(--ds-fg)]">{org.name}</p>
          </li>
          <li className="px-6 py-5">
            <p className="ds-label m-0 normal-case tracking-normal">Plan</p>
            <p className="mt-2 text-lg font-semibold capitalize tracking-tight text-[var(--ds-fg)]">
              {org.plan}
            </p>
          </li>
          {canManageStaff ? (
            <li className="px-6 py-5">
              <p className="ds-label m-0 normal-case tracking-normal">Staff access</p>
              <p className="mt-2 text-[var(--ds-fg-secondary)]">
                Manage who can sign in and their roles.
              </p>
              <Link
                href={`/${orgSlug}/settings/staff`}
                className="ds-btn ds-btn--secondary mt-3 inline-flex"
              >
                Staff roster
              </Link>
            </li>
          ) : null}
        </ul>
      </Card>

      {!easy ? (
        <Card className="mt-6 text-sm text-[var(--ds-fg-secondary)]">
          <p>
            <strong className="text-slate-800">PulsePoint Commerce</strong> (dues, storefronts) is on the
            roadmap — see{" "}
            <Link href={`/${orgSlug}/commerce`} className="pc-link">
              PulsePoint Commerce
            </Link>
            .
          </p>
          <p className="mt-3">
            Platform subscription:{" "}
            <Link href="/platform/billing" className="pc-link">
              platform billing
            </Link>
            .
          </p>
        </Card>
      ) : (
        <p className="mt-6 text-[var(--pc-text-secondary)]">
          Need to change your plan? Contact your PulsePoint representative.
        </p>
      )}
    </AdminPage>
  );
}
