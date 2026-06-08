/**
 * Member portal navigation — six member-facing areas + hub routes.
 */
export type PortalSectionId =
  | "membership"
  | "events"
  | "committees"
  | "certifications"
  | "invoices"
  | "activity";

export type PortalNavItem = {
  id: PortalSectionId | "home" | "communities" | "store";
  label: string;
  shortLabel: string;
  href: (orgSlug: string) => string;
  /** Anchor on hub page — scroll target */
  sectionId?: PortalSectionId;
};

export const PORTAL_HUB_SECTIONS: PortalNavItem[] = [
  {
    id: "membership",
    label: "My membership",
    shortLabel: "Membership",
    href: (slug) => `/${slug}/portal#membership`,
    sectionId: "membership",
  },
  {
    id: "events",
    label: "My events",
    shortLabel: "Events",
    href: (slug) => `/${slug}/portal#events`,
    sectionId: "events",
  },
  {
    id: "committees",
    label: "My committees",
    shortLabel: "Committees",
    href: (slug) => `/${slug}/portal#committees`,
    sectionId: "committees",
  },
  {
    id: "certifications",
    label: "My certifications",
    shortLabel: "Learning",
    href: (slug) => `/${slug}/portal#certifications`,
    sectionId: "certifications",
  },
  {
    id: "invoices",
    label: "My invoices",
    shortLabel: "Invoices",
    href: (slug) => `/${slug}/portal#invoices`,
    sectionId: "invoices",
  },
  {
    id: "activity",
    label: "My community",
    shortLabel: "Community",
    href: (slug) => `/${slug}/portal#activity`,
    sectionId: "activity",
  },
];

export const PORTAL_TOP_NAV: PortalNavItem[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    href: (slug) => `/${slug}/portal`,
  },
  ...PORTAL_HUB_SECTIONS,
  {
    id: "communities",
    label: "Communities",
    shortLabel: "Spaces",
    href: (slug) => `/${slug}/portal/communities`,
  },
];
