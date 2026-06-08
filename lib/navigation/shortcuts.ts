/**
 * Smart navigation shortcuts — common actions (palette + keyboard).
 */
import type { AdminNavIconId } from "@/lib/nav-config";

export type NavShortcut = {
  id: string;
  label: string;
  description: string;
  href: (orgSlug: string) => string;
  keywords: string[];
  iconId?: AdminNavIconId;
  shortcut?: string;
  section: "actions" | "pages";
};

export function buildNavShortcuts(orgSlug: string): NavShortcut[] {
  const base = `/${orgSlug}`;
  return [
    {
      id: "add-member",
      label: "Add member",
      description: "Create a new member record",
      href: () => `${base}/members/new`,
      keywords: ["create", "new", "member", "person"],
      iconId: "users",
      shortcut: "⌘N",
      section: "actions",
    },
    {
      id: "new-event",
      label: "New event",
      description: "Publish an event to EventCore",
      href: () => `${base}/events/new`,
      keywords: ["create", "calendar", "registration"],
      iconId: "calendar",
      shortcut: "⌘⇧E",
      section: "actions",
    },
    {
      id: "import-members",
      label: "Import members",
      description: "Upload a CSV batch",
      href: () => `${base}/members/imports`,
      keywords: ["csv", "upload", "bulk"],
      iconId: "upload",
      section: "actions",
    },
    {
      id: "renewals",
      label: "Renewal queue",
      description: "Members due for renewal",
      href: () => `${base}/members/renewals`,
      keywords: ["dues", "expire", "lapsed"],
      iconId: "users",
      section: "actions",
    },
    {
      id: "member-pulse",
      label: "MemberPulse",
      description: "Engagement scores and champions",
      href: () => `${base}/members/pulse`,
      keywords: ["engagement", "at-risk", "score"],
      iconId: "users",
      section: "actions",
    },
    {
      id: "intelligence",
      label: "AMS Intelligence",
      description: "Proactive recommendations",
      href: () => `${base}/intelligence`,
      keywords: ["insights", "recommendations", "alerts"],
      iconId: "intelligence",
      shortcut: "⌘⇧I",
      section: "pages",
    },
    {
      id: "command-center",
      label: "Command Center",
      description: "Executive briefing",
      href: () => `${base}/command-center`,
      keywords: ["ceo", "executive", "board"],
      iconId: "chart",
      shortcut: "⌘⇧C",
      section: "pages",
    },
    {
      id: "exceptions",
      label: "Exceptions queue",
      description: "Automation failures to resolve",
      href: () => `${base}/exceptions`,
      keywords: ["errors", "failed", "workflow"],
      iconId: "alert",
      section: "actions",
    },
    {
      id: "portal",
      label: "Member portal",
      description: "Preview self-service experience",
      href: () => `${base}/portal`,
      keywords: ["self-service", "account"],
      iconId: "users",
      section: "pages",
    },
  ];
}
