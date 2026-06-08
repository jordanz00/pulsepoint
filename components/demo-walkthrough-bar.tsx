"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  WALKTHROUGH_STEPS,
  clampStepIndex,
  getWalkthroughStep,
  walkthroughModuleHref,
  walkthroughPageHref,
} from "@/lib/demo-walkthrough";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

function stepIndexForPath(pathname: string, orgSlug: string): number | null {
  const base = `/${orgSlug}`;
  if (pathname === base || pathname === `${base}/`) return 0;
  const found = WALKTHROUGH_STEPS.findIndex(
    (s) => s.path && (pathname === `${base}${s.path}` || pathname.startsWith(`${base}${s.path}/`)),
  );
  return found >= 0 ? found : null;
}

function hrefForStep(orgSlug: string, stepIndex: number, onWalkthroughPage: boolean): string {
  const step = getWalkthroughStep(stepIndex);
  if (onWalkthroughPage) return walkthroughPageHref(orgSlug, stepIndex);
  return walkthroughModuleHref(orgSlug, step.path, { guided: true });
}

export function DemoWalkthroughBar({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const guided = searchParams.get("walkthrough") === "1";
  const onWalkthroughPage = pathname.includes("/walkthrough");

  if (orgSlug !== DEMO_ORG_SLUG) return null;
  if (!guided && !onWalkthroughPage) return null;

  const stepFromUrl = clampStepIndex(searchParams.get("step") ?? undefined);
  const stepFromPath = stepIndexForPath(pathname, orgSlug);
  const index = onWalkthroughPage ? stepFromUrl : (stepFromPath ?? stepFromUrl);
  const step = getWalkthroughStep(index);
  const total = WALKTHROUGH_STEPS.length;
  const prev = index > 0 ? index - 1 : null;
  const next = index < total - 1 ? index + 1 : null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--pc-border)] bg-[var(--bg-surface)] px-4 py-4 shadow-lg lg:left-52 xl:left-56"
      role="region"
      aria-label="Guided tour"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--pc-text-secondary)]">
            Tour step {index + 1} of {total}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--pc-text)]">{step.title}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {prev !== null ? (
            <Link
              href={hrefForStep(orgSlug, prev, onWalkthroughPage)}
              className="pc-btn-secondary min-w-[5.5rem]"
            >
              Back
            </Link>
          ) : null}
          {next !== null ? (
            <Link
              href={hrefForStep(orgSlug, next, onWalkthroughPage)}
              className="pc-btn-primary min-w-[5.5rem]"
            >
              Next
            </Link>
          ) : (
            <Link href={`/${orgSlug}`} className="pc-btn-primary min-w-[5.5rem]">
              Done
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
