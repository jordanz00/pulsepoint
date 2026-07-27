"use client";

import Link from "next/link";
import { PlatformGlanceBriefing } from "@/components/platform/platform-glance-briefing";
import { walkthroughPageHref } from "@/lib/demo-walkthrough";
import { STATIC_DEMO_MODULE_STATS, STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

export default function StaticDemoSuitePage() {
  const orgSlug = STATIC_DEMO_ORG.slug;
  return (
    <div className="pp-admin-glance-page pp-route-enter p-6 lg:p-8">
      <header className="pp-admin-glance-page-head">
        <div>
          <p className="pp-eyebrow">PulsePoint suite</p>
          <h1 className="pp-admin-glance-page-title">All modules</h1>
          <p className="pp-admin-glance-page-lead">
            Twelve modules, one spine — interactive briefing with illustrative counts.
          </p>
        </div>
        <Link href={`/${orgSlug}/`} className="pc-btn-secondary text-sm">
          ← Home
        </Link>
      </header>

      <PlatformGlanceBriefing orgSlug={orgSlug} moduleStats={STATIC_DEMO_MODULE_STATS} />

      <p className="pp-admin-glance-tour-note mt-6">
        <Link href={walkthroughPageHref(orgSlug, 0)} className="pc-link font-semibold">
          Prefer a guided tour?
        </Link>{" "}
        Step through each module with sample workflows.
      </p>
    </div>
  );
}
