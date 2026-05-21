/**
 * Roadmap module preview copy — honest prototype cards for coming-soon products.
 */

import type { ProductId } from "@/lib/products";

export type ProductPreview = {
  headline: string;
  bullets: string[];
  liveAlternative: string;
};

export const PRODUCT_PREVIEWS: Record<ProductId, ProductPreview> = {
  work: {
    headline: "Your staff command center",
    bullets: [
      "Jump to live modules from one workspace",
      "Exception queue for automation triage",
      "Role-based access aligned with Clerk",
    ],
    liveAlternative: "You are here — PulsePoint Work is live.",
  },
  members: {
    headline: "Membership directory done right",
    bullets: [
      "Staged CSV import with human review",
      "Staff notes in one canonical place",
      "ADMIN-gated export with audit trail",
    ],
    liveAlternative: "MemberCore is live in your tenant.",
  },
  events: {
    headline: "Events from publish to check-in",
    bullets: [
      "Public registration pages per event",
      "Capacity, waitlist, and Stripe checkout",
      "Onsite check-in for staff",
    ],
    liveAlternative: "PulsePoint Events is live in your tenant.",
  },
  learn: {
    headline: "Education & certifications (roadmap)",
    bullets: [
      "CE credits tied to the member record",
      "Learning paths and completion tracking",
      "Certificate issuance workflows",
    ],
    liveAlternative: "Use Events for registrations today; Learn ships on the roadmap.",
  },
  giving: {
    headline: "Fundraising & donors (roadmap)",
    bullets: [
      "Donor profiles and campaign tracking",
      "Recurring gifts and acknowledgments",
      "Giving reports for leadership",
    ],
    liveAlternative: "Paid event registration via Stripe is live under Events.",
  },
  commerce: {
    headline: "E-commerce & dues (roadmap)",
    bullets: [
      "Branded storefront for merchandise and dues",
      "Cart and checkout with member context",
      "Revenue reporting with Events today",
    ],
    liveAlternative: "Event paid registration is live; full Commerce is roadmap.",
  },
  engage: {
    headline: "Marketing & communications (roadmap)",
    bullets: [
      "Segmented email campaigns",
      "Engagement metrics per cohort",
      "Templates with approval workflow",
    ],
    liveAlternative: "Registration confirmation email is live via Events.",
  },
  ai: {
    headline: "Staff assist (roadmap)",
    bullets: [
      "Draft communications from approved context",
      "Summaries for board packets",
      "No member data sent without policy",
    ],
    liveAlternative: "See docs/AI-DATA-POLICY.md — AI module not enabled in UI yet.",
  },
  insights: {
    headline: "BI & analytics (roadmap)",
    bullets: [
      "Executive dashboards",
      "Role-based reporting",
      "Power BI–ready semantic layer in docs",
    ],
    liveAlternative: "Export member CSV and event lists from live modules today.",
  },
};
