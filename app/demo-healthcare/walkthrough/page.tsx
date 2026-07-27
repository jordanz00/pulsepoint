"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DemoWalkthroughSteps } from "@/components/demo-walkthrough-steps";
import { clampStepIndex } from "@/lib/demo-walkthrough";
import { STATIC_DEMO_ORG } from "@/lib/static-demo/seed";

function WalkthroughBody() {
  const params = useSearchParams();
  const activeIndex = clampStepIndex(params.get("step") ?? "0");
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <p className="pp-eyebrow">Guided tour</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">
          PulsePoint walkthrough
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--pc-text-secondary)]">
          Same tour script as localhost. Module deep-links open interactive previews in this static
          demo.
        </p>
      </header>
      <DemoWalkthroughSteps orgSlug={STATIC_DEMO_ORG.slug} activeIndex={activeIndex} />
    </div>
  );
}

export default function StaticDemoWalkthroughPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <p className="page-subtitle">Loading tour…</p>
        </div>
      }
    >
      <WalkthroughBody />
    </Suspense>
  );
}
