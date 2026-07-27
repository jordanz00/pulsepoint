"use client";

import { MemberCoreMarketingPreview } from "@/components/marketing/membercore-marketing-preview";
import { STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

export default function StaticDemoMembersPage() {
  return (
    <div className="space-y-4 p-6 lg:p-8">
      <header>
        <p className="pp-eyebrow">MemberCore</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">
          Member directory
        </h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Interactive preview — same patterns as the live module. Illustrative sample.
        </p>
      </header>
      <MemberCoreMarketingPreview demoHref={`/${STATIC_DEMO_ORG.slug}/members/`} />
    </div>
  );
}
