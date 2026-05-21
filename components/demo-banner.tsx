/**
 * Persistent banner shown whenever the request carries a valid demo cookie.
 *
 * Renders nothing when:
 *   - Demo mode is disabled (env), or
 *   - The visitor has no demo cookie.
 *
 * Server Component: safe to drop into the root layout.
 */

import { getDemoSession } from "@/lib/demo-mode";

export async function DemoBanner() {
  const demo = await getDemoSession();
  if (!demo) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-[var(--hap-warm)] bg-[var(--pc-warm-muted)] px-4 py-2 text-xs text-[var(--hap-black)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[var(--hap-warm)]" />
          <strong className="uppercase tracking-wide">Demo mode</strong>
          <span className="hidden sm:inline">
            — signed in as Sterling Healthcare owner. All data is illustrative.
          </span>
        </div>
        <form action="/api/demo/exit" method="post">
          <button
            type="submit"
            className="rounded-md border border-[var(--hap-warm)] bg-white px-2 py-1 font-semibold text-[var(--hap-black)] hover:bg-[var(--pc-bg)]"
          >
            Exit demo
          </button>
        </form>
      </div>
    </div>
  );
}
