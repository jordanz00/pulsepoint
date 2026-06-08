/**
 * Persistent banner when demo cookie is present.
 */

import { getDemoSession } from "@/lib/demo-mode";

export async function DemoBanner() {
  const demo = await getDemoSession();
  if (!demo) return null;

  return (
    <div className="pc-demo-banner">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4">
        <p className="text-sm text-[var(--pc-text)]">
          <strong>Demo mode</strong>
          <span className="mx-2 text-[var(--pc-text-tertiary)]">·</span>
          Sample data only
        </p>
        <form action="/api/demo/exit" method="post">
          <button type="submit" className="pc-btn-secondary !min-h-9 !px-3 !py-1.5 !text-sm">
            Exit demo
          </button>
        </form>
      </div>
    </div>
  );
}
