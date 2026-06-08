/**
 * Admin chrome when DEMO_MODE=true — no Clerk OrganizationSwitcher / UserButton.
 */
export function AdminTopBar({ orgName }: { orgName: string }) {
  return (
    <header className="pc-admin-topbar glass pp-glass-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
      <p className="text-sm text-[var(--pc-text-secondary)]">
        <span className="font-semibold text-[var(--pc-text)]">{orgName}</span>
        <span> · Practice demo</span>
      </p>
      <form action="/api/demo/exit" method="post">
        <button
          type="submit"
          className="pc-btn-secondary !min-h-9 !px-3 !py-1.5 !text-sm"
        >
          Exit demo
        </button>
      </form>
    </header>
  );
}
