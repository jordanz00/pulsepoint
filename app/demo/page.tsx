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

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  isDemoModeEnabled,
} from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const enabled = isDemoModeEnabled();
  const seeded = enabled
    ? Boolean(await prisma.organization.findUnique({ where: { id: DEMO_ORG_ID } }))
    : false;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Demo mode</Badge>
          <Badge variant="roadmap">Prototype only</Badge>
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-slate-900">
          PulsePoint prototype demo
        </h1>
        <p className="mt-3 text-slate-600">
          Demo mode signs you in as the owner of a fully seeded sample
          association (Sterling Healthcare Association) — no Clerk account
          required. All data is illustrative and resets when you re-seed.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Safety rails</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Refuses to run when <code>NODE_ENV=production</code>.</li>
            <li>Requires <code>DEMO_MODE=true</code> and a 32+ char <code>DEMO_SESSION_SECRET</code>.</li>
            <li>Cookie is HMAC-signed; cannot be forged without the server secret.</li>
            <li>Audit log records every enter / exit.</li>
          </ul>
        </div>

        {enabled && seeded ? (
          <EnterForm />
        ) : enabled && !seeded ? (
          <NeedsSeedBlock />
        ) : (
          <DisabledBlock />
        )}

        <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-500">
          See <code>docs/DEMO-MODE.md</code> for the full setup.
        </div>
      </div>
    </main>
  );
}

function EnterForm() {
  return (
    <form action="/api/demo/enter" method="post" className="mt-6 space-y-3">
      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Enter demo as Sterling Healthcare owner
      </button>
      <p className="text-center text-xs text-slate-500">
        Bounces you to <code>/{DEMO_ORG_SLUG}</code> with a 24-hour signed cookie.
      </p>
    </form>
  );
}

function NeedsSeedBlock() {
  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Demo data not seeded yet.</p>
      <p className="mt-1">
        Run the seed script, then refresh this page:
      </p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-amber-900/90 p-3 text-xs text-amber-50">
        pnpm db:seed:demo
      </pre>
    </div>
  );
}

function DisabledBlock() {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">Demo mode is disabled.</p>
      <p className="mt-2">To enable it locally, add to <code>.env.local</code>:</p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-50">{`DEMO_MODE=true
DEMO_SESSION_SECRET=replace-with-32+char-random-string-please`}</pre>
      <p className="mt-2 text-xs text-slate-500">
        Then run <code>pnpm db:seed:demo</code> and restart <code>pnpm dev</code>.
      </p>
    </div>
  );
}
