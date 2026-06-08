import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { walkthroughPageHref } from "@/lib/demo-walkthrough";
import { loadAdminModuleStats } from "@/lib/load-admin-module-stats";

export const dynamic = "force-dynamic";

export default async function SuitePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const moduleStats = await loadAdminModuleStats(staff.orgId);

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="pp-admin-glance-page pp-route-enter">
        <header className="pp-admin-glance-page-head">
          <div>
            <p className="pp-eyebrow">PulsePoint suite</p>
            <h1 className="pp-admin-glance-page-title">All modules</h1>
            <p className="pp-admin-glance-page-lead">
              Twelve modules, one spine — same interactive briefing as the marketing site, with live
              counts from your database.
            </p>
          </div>
          <Link href={`/${orgSlug}`} className="pc-btn-secondary text-sm">
            ← Home
          </Link>
        </header>

        <PlatformGlanceBriefing orgSlug={orgSlug} moduleStats={moduleStats} />

        <p className="pp-admin-glance-tour-note">
          <Link href={walkthroughPageHref(orgSlug, 0)} className="pc-link font-semibold">
            Prefer a guided tour?
          </Link>{" "}
          Step through each module with sample workflows.
        </p>
      </div>
    </AdminPage>
  );
}
