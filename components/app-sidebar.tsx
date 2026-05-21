"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavItem } from "@/lib/nav-config";
import { Badge } from "@/components/ui/badge";

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  const hrefDepth = href.split("/").filter(Boolean).length;
  if (hrefDepth <= 1) return false;
  return pathname.startsWith(`${href}/`);
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: AdminNavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <ul className="mt-2 space-y-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sky-500/15 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="truncate">{item.shortLabel}</span>
                {item.status === "live" && !active && (
                  <Badge variant="live">Live</Badge>
                )}
                {item.status === "roadmap" && (
                  <Badge variant="roadmap">Soon</Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar({
  orgSlug,
  orgName,
  nav,
}: {
  orgSlug: string;
  orgName: string;
  nav: AdminNavItem[];
}) {
  const pathname = usePathname();
  const home = nav.filter((n) => n.group === "home");
  const products = nav.filter((n) => n.group === "products");
  const system = nav.filter((n) => n.group === "system");

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[var(--pc-navy)] lg:w-60">
      <div className="border-b border-slate-800/80 px-4 py-5">
        <Link href={`/${orgSlug}`} className="block font-semibold text-white">
          PulsePoint
        </Link>
        <p className="mt-1 truncate text-xs text-slate-400">{orgName}</p>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-sky-400/90">
          AMS prototype
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <NavGroup title="Home" items={home} pathname={pathname} />
        <NavGroup title="Products" items={products} pathname={pathname} />
        <NavGroup title="Operations" items={system} pathname={pathname} />
      </nav>
      <div className="border-t border-slate-800/80 p-3 text-[10px] text-slate-500">
        Live: MemberCore · Events · Work
      </div>
    </aside>
  );
}
