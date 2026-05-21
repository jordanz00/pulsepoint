import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

type NavItem = { href: string; label: string };

export function AppShell({
  orgSlug,
  orgName,
  nav,
  children,
}: {
  orgSlug: string;
  orgName: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href={`/${orgSlug}`} className="font-semibold text-teal-800">
              PulseCore
            </Link>
            <span className="hidden text-sm text-zinc-500 sm:inline">{orgName}</span>
            <nav className="flex gap-3 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-zinc-600 hover:text-teal-800"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher hidePersonal />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
