/**
 * Admin navigation — enterprise information architecture.
 */

export type NavItemStatus = "live" | "alpha" | "roadmap";

/** Logical enterprise groups — ordered for sidebar display */
export type AdminNavGroup =
  | "command"
  | "membership"
  | "programs"
  | "revenue"
  | "governance"
  | "engagement"
  | "admin";

export type AdminNavIconId =
  | "dashboard"
  | "users"
  | "calendar"
  | "alert"
  | "graduation"
  | "cart"
  | "heart"
  | "megaphone"
  | "chart"
  | "intelligence"
  | "crm"
  | "partnerships"
  | "advocacy"
  | "communities"
  | "committees"
  | "suite"
  | "settings"
  | "upload"
  | "clipboard";

export type AdminNavItem = {
  id: string;
  name: string;
  href: string;
  iconId: AdminNavIconId;
  status: NavItemStatus;
  description: string;
  group: AdminNavGroup;
};

export const NAV_GROUP_ORDER: AdminNavGroup[] = [
  "command",
  "membership",
  "programs",
  "revenue",
  "governance",
  "engagement",
  "admin",
];

export const NAV_GROUP_LABELS: Record<AdminNavGroup, string> = {
  command: "Command",
  membership: "Membership",
  programs: "Programs",
  revenue: "Revenue",
  governance: "Governance",
  engagement: "Engagement",
  admin: "Administration",
};

export function buildAdminNav(orgSlug: string): AdminNavItem[] {
  const base = `/${orgSlug}`;

  const items: AdminNavItem[] = [
    // Command — leadership & ops entry
    {
      id: "work",
      name: "Overview",
      href: base,
      iconId: "dashboard",
      status: "live",
      group: "command",
      description: "Daily operations dashboard",
    },
    {
      id: "intelligence",
      name: "Intelligence",
      href: `${base}/intelligence`,
      iconId: "intelligence",
      status: "live",
      group: "command",
      description: "Proactive insights and recommended actions",
    },
    {
      id: "command-center",
      name: "Command Center",
      href: `${base}/command-center`,
      iconId: "chart",
      status: "live",
      group: "command",
      description: "CEO executive briefing",
    },
    {
      id: "suite",
      name: "All modules",
      href: `${base}/suite`,
      iconId: "suite",
      status: "live",
      group: "command",
      description: "Explore the full AMS suite",
    },
    {
      id: "insights",
      name: "Insights",
      href: `${base}/insights`,
      iconId: "chart",
      status: "alpha",
      group: "command",
      description: "Board KPIs and scheduled reports",
    },

    // Membership
    {
      id: "members",
      name: "MemberCore",
      href: `${base}/members`,
      iconId: "users",
      status: "live",
      group: "membership",
      description: "Directory, profiles, and engagement",
    },

    // Programs
    {
      id: "events",
      name: "EventCore",
      href: `${base}/events`,
      iconId: "calendar",
      status: "live",
      group: "programs",
      description: "Events, registration, and check-in",
    },
    {
      id: "learn",
      name: "Learn",
      href: `${base}/learn`,
      iconId: "graduation",
      status: "alpha",
      group: "programs",
      description: "CE credits and courses",
    },
    {
      id: "communities",
      name: "Communities",
      href: `${base}/communities`,
      iconId: "communities",
      status: "alpha",
      group: "programs",
      description: "Member spaces and discussions",
    },

    // Revenue
    {
      id: "commerce",
      name: "Commerce",
      href: `${base}/commerce`,
      iconId: "cart",
      status: "alpha",
      group: "revenue",
      description: "Dues catalog and orders",
    },
    {
      id: "giving",
      name: "Giving",
      href: `${base}/giving`,
      iconId: "heart",
      status: "alpha",
      group: "revenue",
      description: "Fundraising and donors",
    },
    {
      id: "partnerships",
      name: "Partnerships",
      href: `${base}/deals`,
      iconId: "partnerships",
      status: "alpha",
      group: "revenue",
      description: "Sponsorship pipeline",
    },

    // Governance
    {
      id: "advocacy",
      name: "Advocacy",
      href: `${base}/enterprise/advocacy`,
      iconId: "advocacy",
      status: "alpha",
      group: "governance",
      description: "Policy issues and campaigns",
    },
    {
      id: "committees",
      name: "Committees",
      href: `${base}/committees`,
      iconId: "committees",
      status: "alpha",
      group: "governance",
      description: "Board and committee rosters",
    },

    // Engagement
    {
      id: "crm",
      name: "CRM",
      href: `${base}/crm`,
      iconId: "crm",
      status: "alpha",
      group: "engagement",
      description: "Contacts, forms, and workflows",
    },
    {
      id: "engage",
      name: "Engage",
      href: `${base}/engage`,
      iconId: "megaphone",
      status: "alpha",
      group: "engagement",
      description: "Email templates and segments",
    },

    // Administration
    {
      id: "exceptions",
      name: "Exceptions",
      href: `${base}/exceptions`,
      iconId: "alert",
      status: "live",
      group: "admin",
      description: "Automation exceptions queue",
    },
    {
      id: "imports",
      name: "Imports",
      href: `${base}/members/imports`,
      iconId: "upload",
      status: "live",
      group: "admin",
      description: "Member import history",
    },
    {
      id: "audit",
      name: "Audit",
      href: `${base}/audit`,
      iconId: "clipboard",
      status: "live",
      group: "admin",
      description: "Staff action history",
    },
    {
      id: "settings",
      name: "Settings",
      href: `${base}/settings`,
      iconId: "settings",
      status: "live",
      group: "admin",
      description: "Organization settings",
    },
  ];

  return items;
}

/** @deprecated Use buildAdminNav */
export function isSimpleDemoNav(_orgSlug: string): boolean {
  return false;
}
