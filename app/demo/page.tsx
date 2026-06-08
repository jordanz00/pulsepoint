/**
 * /demo — prototype landing page.
 *
 * If demo mode is disabled (default), shows a short explanation of why and
 * how to turn it on. If enabled, shows a single "Enter demo" button that
 * POSTs to /api/demo/enter.
 *
 * This page intentionally does NOT use Clerk hooks — demo mode must work
 * with zero Clerk setup.
 */

import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  isDemoModeEnabled,
} from "@/lib/demo-mode";
import { portfolioWalkthroughMinutes, walkthroughTotalMinutes } from "@/lib/demo-walkthrough";

export const dynamic = "force-dynamic";

async function isDemoSeeded(): Promise<boolean | "db_offline"> {
  try {
    const org = await prisma.organization.findUnique({ where: { id: DEMO_ORG_ID } });
    return Boolean(org);
  } catch {
    return "db_offline";
  }
}

export default async function DemoPage() {
  const enabled = isDemoModeEnabled();
  const seeded = enabled ? await isDemoSeeded() : false;

  let actionBlock: ReactNode;
  if (enabled && seeded === true) {
    actionBlock = (
      <div className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <form action="/api/demo/enter" method="post" className="space-y-2">
            <input type="hidden" name="mode" value="walkthrough" />
            <button type="submit" className="pc-btn-primary w-full !rounded-xl !py-3">
              Guided tour
            </button>
            <p className="text-center text-xs text-[var(--pc-text-tertiary)]">
              Step-by-step · ~{portfolioWalkthroughMinutes()} min highlights · {walkthroughTotalMinutes()} min full
            </p>
          </form>
          <form action="/api/demo/enter" method="post" className="space-y-2">
            <input type="hidden" name="mode" value="suite" />
            <button type="submit" className="pc-btn-secondary w-full !rounded-xl !py-3">
              Full suite
            </button>
            <p className="text-center text-xs text-[var(--pc-text-tertiary)]">All modules enabled</p>
          </form>
        </div>
        <form action="/api/demo/enter" method="post">
          <button
            type="submit"
            className="w-full text-center text-sm font-medium text-[var(--pc-accent)] hover:underline"
          >
            Overview only →
          </button>
        </form>
      </div>
    );
  } else if (enabled && seeded === "db_offline") {
    actionBlock = (
      <div className="mt-8 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-accent-soft)] p-5 text-sm">
        <p className="font-semibold">Database not set up</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg-inverse)] p-3 text-xs text-[var(--fg-on-inverse)]">
          pnpm demo:setup
        </pre>
      </div>
    );
  } else if (enabled && seeded === false) {
    actionBlock = (
      <div className="mt-8 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-accent-soft)] p-5 text-sm">
        <p className="font-semibold">Seed demo data first:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg-inverse)] p-3 text-xs text-[var(--fg-on-inverse)]">
          pnpm db:seed:demo
        </pre>
      </div>
    );
  } else {
    actionBlock = (
      <div className="mt-8 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-bg)] p-5 text-sm">
        <p className="font-semibold">Demo mode is off.</p>
        <p className="mt-2 text-[var(--pc-text-secondary)]">Add to <code>.env.local</code>:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg-inverse)] p-3 text-xs text-[var(--fg-on-inverse)]">{`DEMO_MODE=true
DEMO_SESSION_SECRET=replace-with-32+char-random-string`}</pre>
      </div>
    );
  }

  return (
    <main className="pp-canvas min-h-screen px-6 py-16">
      <div className="pc-glass-panel mx-auto max-w-lg p-8 text-[var(--fg-default)]">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Demo</Badge>
          <Badge variant="roadmap">Prototype</Badge>
        </div>

        <h1 className="pc-display mt-5 text-2xl font-semibold text-[var(--pc-text)]">Try PulsePoint</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--pc-text-secondary)]">
          Sample healthcare association—members, events, and staff tools. One click to enter. Illustrative data only.
        </p>

        {actionBlock}

        <p className="mt-8 text-center text-xs text-[var(--pc-text-tertiary)]">
          <a href="/" className="pc-link">
            ← Marketing site
          </a>
        </p>
      </div>
    </main>
  );
}
