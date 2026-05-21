import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import type { AdminNavItem } from "@/lib/nav-config";

export function AppShell({
  orgSlug,
  orgName,
  nav,
  children,
}: {
  orgSlug: string;
  orgName: string;
  nav: AdminNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--pc-bg)]">
      <AppSidebar orgSlug={orgSlug} orgName={orgName} nav={nav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <OrganizationSwitcher hidePersonal />
          <UserButton />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
