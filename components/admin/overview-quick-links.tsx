import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

const LINKS = [
  { id: "members", href: "members", label: "Members", icon: Users },
  { id: "events", href: "events", label: "Events", icon: CalendarDays },
  {
    id: "command",
    href: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
  },
  { id: "intel", href: "intelligence", label: "Intelligence", icon: Sparkles },
] as const;

export function OverviewQuickLinks({ orgSlug }: { orgSlug: string }) {
  return (
    <nav className="overview-quick-links" aria-label="Quick destinations">
      <p className="overview-quick-links__label">Go to</p>
      <ul className="overview-quick-links__list">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.id}>
              <Link
                href={`/${orgSlug}/${link.href}`}
                className="overview-quick-links__item"
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
