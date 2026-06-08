/**
 * Plain-English help text for admin and demo (no docs links).
 */

import type { ProductId } from "@/lib/products";

export const OVERVIEW_HELP = {
  members:
    "How many people belong to your association. Open the directory to search, add notes, or export a list.",
  events:
    "Events you have created. Publish an event to collect registrations and check people in on the day.",
  plan: "Your organization's service level in this prototype environment.",
} as const;

export const NAV_HELP: Record<string, string> = {
  Home: "Your starting screen with the tasks you use most.",
  Overview: "Your home screen: counts, shortcuts, and what's next.",
  "Guided tour": "A step-by-step walkthrough of the demo.",
  Work: "Day-to-day staff tools and productivity shortcuts.",
  "Staff tools": "Day-to-day staff tools in one place.",
  Members: "Find members, add records, and keep one profile per person.",
  MemberCore: "Find members, add records, and keep one profile per person.",
  Events: "Create events, share a registration link, and check in attendees.",
  "All modules": "Open every area of the system in one list.",
  Learn: "Courses and continuing education credits (early preview).",
  Giving: "Donation campaigns and gift records (early preview).",
  Commerce: "Sell dues or products online (early preview).",
  Engage: "Email your members in groups (early preview).",
  Insights: "Charts and snapshots of how your association is doing (early preview).",
  Portal: "Preview what members would see when they sign in.",
  Settings: "Organization name, plan, and admin preferences.",
};

export const PRODUCT_HELP: Record<ProductId, string> = {
  work: "The main workspace for your team—same look and feel across every module.",
  members:
    "Your member directory: search, tags, staff-only notes, and CSV export.",
  crm: "Relationship-first CRM: workflows, web forms, prospector, and contact records.",
  deals: "Sponsorship and partnership pipelines, stage tracking, and executive report dashboards.",
  advertising: "Campaign and ad placement tracking for association media programs.",
  events:
    "Build an event, share a link for sign-up, take payment when needed, and check people in.",
  learn: "Track classes and education credits on each member's profile (coming soon for most associations).",
  giving: "Run fundraising campaigns and record gifts (coming soon for most associations).",
  commerce: "Online payments for dues and store items (coming soon for most associations).",
  engage: "Send email to groups of members (coming soon for most associations).",
  insights:
    "Revenue command center: dues vs non-dues, member CRM counts, and an audit trail from your live data.",
  advocacy:
    "Track policy issues, take-action campaigns, and which member hospitals have responded (early preview).",
};
