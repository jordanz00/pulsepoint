"use client";

import { Suspense } from "react";
import { DemoWalkthroughBar } from "@/components/demo-walkthrough-bar";
import { isDemoOrgSlug } from "@/lib/demo-suite";

export function DemoExperienceShell({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: React.ReactNode;
}) {
  const isDemo = isDemoOrgSlug(orgSlug);

  return (
    <>
      {children}
      {isDemo ? (
        <Suspense fallback={null}>
          <DemoWalkthroughBar orgSlug={orgSlug} />
        </Suspense>
      ) : null}
      {isDemo ? <div className="h-28 shrink-0" aria-hidden /> : null}
    </>
  );
}
