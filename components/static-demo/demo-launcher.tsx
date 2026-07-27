"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";
import { Badge } from "@/components/ui/badge";
import {
  portfolioWalkthroughMinutes,
  walkthroughTotalMinutes,
} from "@/lib/demo-walkthrough";
import {
  enterStaticDemo,
  staticDemoLandingPath,
  type StaticDemoMode,
} from "@/lib/static-demo/session";

const isGhPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

function EnterButton({
  mode,
  className,
  children,
  hint,
}: {
  mode: StaticDemoMode;
  className: string;
  children: React.ReactNode;
  hint: string;
}) {
  const router = useRouter();

  if (isGhPages) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className={className}
          onClick={() => {
            enterStaticDemo(mode);
            router.push(staticDemoLandingPath(mode));
          }}
        >
          {children}
        </button>
        <p className="text-center text-xs text-[var(--pc-text-tertiary)]">{hint}</p>
      </div>
    );
  }

  return (
    <form action="/api/demo/enter" method="post" className="space-y-2">
      {mode !== "overview" ? <input type="hidden" name="mode" value={mode} /> : null}
      <button type="submit" className={className}>
        {children}
      </button>
      <p className="text-center text-xs text-[var(--pc-text-tertiary)]">{hint}</p>
    </form>
  );
}

/** Demo launcher — cookie POST on localhost; sessionStorage on GitHub Pages. */
export function DemoLauncher() {
  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={null} standalone />
      <main id="main-content" className="mk-section">
        <div className="mk-container max-w-xl">
          <div className="pc-simple-hero glass pp-glass-surface p-8 sm:p-10">
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">Demo mode</Badge>
              {isGhPages ? (
                <Badge variant="roadmap">Static · GitHub Pages</Badge>
              ) : (
                <Badge variant="live">Local server</Badge>
              )}
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.03em] text-[var(--pc-text)]">
              Enter the PulsePoint demo
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--pc-text-secondary)]">
              Explore <strong>Sterling Healthcare Association</strong> as the owner — membership,
              events, insights, and the guided tour.
              {isGhPages
                ? " This build runs entirely in your browser on GitHub Pages."
                : " Uses the local SQLite demo database."}
            </p>
            <p className="mt-2 text-sm text-[var(--pc-text-tertiary)]">
              Illustrative data only · every screen labeled honestly
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <EnterButton
                mode="walkthrough"
                className="pc-btn-primary w-full !rounded-xl !py-3"
                hint={`Step-by-step · ~${portfolioWalkthroughMinutes()} min highlights · ${walkthroughTotalMinutes()} min full`}
              >
                Guided tour
              </EnterButton>
              <EnterButton
                mode="suite"
                className="pc-btn-secondary w-full !rounded-xl !py-3"
                hint="All modules enabled"
              >
                Full suite
              </EnterButton>
            </div>
            <div className="mt-4">
              <EnterButton
                mode="overview"
                className="w-full text-center text-sm font-medium text-[var(--pc-accent)] hover:underline"
                hint=""
              >
                Overview only →
              </EnterButton>
            </div>

            <p className="mt-8 text-center text-sm text-[var(--pc-text-tertiary)]">
              <Link href="/" className="hover:underline">
                ← Back to homepage
              </Link>
            </p>
          </div>
        </div>
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
