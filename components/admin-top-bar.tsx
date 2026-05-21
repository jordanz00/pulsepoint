import { DEMO_ORG_SLUG } from "@/lib/demo-mode";

/**
 * Admin chrome when DEMO_MODE=true — no Clerk OrganizationSwitcher / UserButton.
 */
export function AdminTopBar({ orgName }: { orgName: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
      <div className="text-sm text-[var(--pc-muted)]">
        <span className="font-semibold text-[var(--pc-text)]">{orgName}</span>
        <span className="mx-2">·</span>
        <span>Demo owner</span>
        <span className="mx-2">·</span>
        <code className="text-xs">/{DEMO_ORG_SLUG}</code>
      </div>
      <form action="/api/demo/exit" method="post">
        <button
          type="submit"
          className="rounded-lg border border-[var(--pc-border-strong)] px-3 py-1.5 text-sm font-medium text-[var(--pc-text)] hover:bg-[var(--pc-bg)]"
        >
          Exit demo
        </button>
      </form>
    </header>
  );
}
