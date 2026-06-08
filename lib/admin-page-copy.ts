/**
 * Plain-English page titles for admin (especially demo / non-technical staff).
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

export function isEasyAdminMode(orgSlug: string): boolean {
  return orgSlug === DEMO_ORG_SLUG;
}

export const ADMIN_PAGES = {
  members: {
    title: "Members",
    subtitleEasy: "Look up people in your association.",
    subtitleFull: "Directory, engagement, and staff notes.",
  },
  events: {
    title: "Events",
    subtitleEasy: "Create events, email attendees, and share a sign-up link.",
    subtitleFull: "Registration, email, check-in, and tickets.",
  },
  exceptions: {
    title: "Items to fix",
    subtitleEasy: "Steps that need a quick check—nothing is lost.",
    subtitleFull: "Review failed emails or payment steps.",
  },
  imports: {
    title: "Upload member list",
    subtitleEasy: "Review a spreadsheet before it changes your live list.",
    subtitleFull: "Stage CSV rows, then approve or reject the batch.",
  },
  walkthrough: {
    title: "Guided tour",
    subtitleEasy: "A short walk through the main screens.",
    subtitleFull: "Step-by-step demonstration for your team.",
  },
  learn: {
    title: "Learning",
    subtitleEasy: "Classes and education credits (preview).",
    subtitleFull: "Courses, credit types, and awards.",
  },
  giving: {
    title: "Fundraising",
    subtitleEasy: "Campaigns and gifts (preview).",
    subtitleFull: "Donation campaigns and gift records.",
  },
  commerce: {
    title: "Online payments",
    subtitleEasy: "Dues and store checkout (preview).",
    subtitleFull: "Products, orders, and payments.",
  },
  engage: {
    title: "Email",
    subtitleEasy: "Send email to groups of members (preview).",
    subtitleFull: "Templates, audiences, and send history.",
  },
  insights: {
    title: "Insights",
    subtitleEasy: "Dues, non-dues, and member counts (preview).",
    subtitleFull: "Revenue, membership KPIs, and scheduled reports.",
  },
  intelligence: {
    title: "AMS Intelligence",
    subtitleEasy: "Short recommendations — what needs attention today.",
    subtitleFull: "Proactive insights across membership, events, sponsorship, advocacy, and committees.",
  },
  deals: {
    title: "Partnerships & pipeline reports",
    subtitleEasy: "Track sponsorship opportunities and revenue charts (preview).",
    subtitleFull:
      "Partnership pipeline with executive dashboards, widgets, and team analytics.",
  },
  settings: {
    title: "Settings",
    subtitleEasy: "Your organization name and plan.",
    subtitleFull: "Organization profile and platform links.",
  },
} as const;

export function pageSubtitle(
  orgSlug: string,
  key: keyof typeof ADMIN_PAGES,
): string {
  const p = ADMIN_PAGES[key];
  return isEasyAdminMode(orgSlug) ? p.subtitleEasy : p.subtitleFull;
}

/** Human-readable member/event status */
export function memberStatusLabel(status: string): string {
  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "Inactive";
  if (status === "LAPSED") return "Lapsed";
  return status;
}

export function eventStatusLabel(status: string): string {
  if (status === "PUBLISHED") return "Published";
  if (status === "DRAFT") return "Draft";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "COMPLETED") return "Completed";
  return status;
}
