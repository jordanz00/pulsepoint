import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { StaffRosterPanel } from "@/components/settings/staff-roster-panel";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageCapability } from "@/lib/admin-page-guard";
import { loadStaffRoster } from "@/lib/staff/load-staff-roster";

export const metadata = {
  title: "Staff access — PulsePoint",
  description: "Manage staff roles and organization access.",
};

export default async function StaffAccessPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requirePageCapability(
    orgSlug,
    "org:settings",
    `/${orgSlug}/settings`,
  );

  const { memberships } = await loadStaffRoster(staff.orgId);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Staff access"
        subtitle="Who can sign in to this organization and what they can do. Changes are audited."
        backHref={`/${orgSlug}/settings`}
        backLabel="Settings"
      />

      <StaffRosterPanel
        orgSlug={orgSlug}
        rows={memberships}
        actorRole={staff.role}
        currentUserId={staff.userId}
      />

      <p className="ds-page-subtitle">
        Role changes apply on next sign-in. Owners can assign any role; admins can manage staff and
        admin access. See{" "}
        <Link href={`/${orgSlug}/audit`} className="ds-page-eyebrow">
          audit log
        </Link>{" "}
        for history.
      </p>
    </AdminPage>
  );
}
