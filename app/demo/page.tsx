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
      <form action="/api/demo/enter" method="post" className="mt-6 space-y-3">
        <button type="submit" className="pc-btn-primary w-full !rounded-xl !py-3">
          Enter demo as Sterling Healthcare owner
        </button>
        <p className="text-center text-xs text-slate-500">
          Bounces you to <code>/{DEMO_ORG_SLUG}</code> with a 24-hour signed cookie.
        </p>
      </form>
    );
  } else if (enabled && seeded === "db_offline") {
    actionBlock = (
      <div className="mt-6 rounded-xl border border-[var(--hap-warm)]/50 bg-[var(--pc-warm-muted)] p-4 text-sm text-[var(--hap-black)]">
        <p className="font-semibold">Demo database not set up yet</p>
        <p className="mt-1">One command (SQLite file — no Docker):</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--hap-blue-hover)] p-3 text-xs text-white">
          pnpm demo:setup
        </pre>
        <p className="mt-2 text-xs text-[var(--pc-muted)]">Then refresh this page.</p>
      </div>
    );
  } else if (enabled && seeded === false) {
    actionBlock = (
      <div className="mt-6 rounded-xl border border-[var(--hap-warm)]/50 bg-[var(--pc-warm-muted)] p-4 text-sm text-[var(--hap-black)]">
        <p className="font-semibold">Demo data not seeded yet.</p>
        <p className="mt-1">Run the seed script, then refresh this page:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--hap-blue-hover)] p-3 text-xs text-white">
          pnpm db:seed:demo
        </pre>
      </div>
    );
  } else {
    actionBlock = (
      <div className="mt-6 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-bg)] p-4 text-sm text-[var(--pc-text)]">
        <p className="font-semibold">Demo mode is disabled.</p>
        <p className="mt-2">To enable it locally, add to <code>.env.local</code>:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--hap-blue-hover)] p-3 text-xs text-white">{`DEMO_MODE=true
DEMO_SESSION_SECRET=replace-with-32+char-random-string-please`}</pre>
        <p className="mt-2 text-xs text-[var(--pc-muted)]">
          Then run <code>pnpm db:seed:demo</code> and restart <code>pnpm dev</code>.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--pc-bg)] px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--pc-border)] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Demo mode</Badge>
          <Badge variant="roadmap">Prototype only</Badge>
        </div>

        <h1 className="pc-display mt-4 text-3xl font-semibold text-[var(--pc-text)]">
          PulsePoint prototype demo
        </h1>
        <p className="mt-3 text-[var(--pc-muted)]">
          Demo mode signs you in as the owner of a fully seeded sample
          association (Sterling Healthcare Association) — no Clerk account
          required. All data is illustrative and resets when you re-seed.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-bg)] p-4 text-sm text-[var(--pc-text)]">
          <p className="font-semibold">Safety rails</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Refuses to run when <code>NODE_ENV=production</code>.
            </li>
            <li>
              Requires <code>DEMO_MODE=true</code> and a 32+ char{" "}
              <code>DEMO_SESSION_SECRET</code>.
            </li>
            <li>Cookie is HMAC-signed; cannot be forged without the server secret.</li>
            <li>Audit log records every enter / exit.</li>
          </ul>
        </div>

        {actionBlock}

        <div className="mt-8 border-t border-[var(--pc-border)] pt-4 text-xs text-[var(--pc-muted)]">
          See <code>docs/DEMO-MODE.md</code> for the full setup.
        </div>
      </div>
    </main>
  );
}
