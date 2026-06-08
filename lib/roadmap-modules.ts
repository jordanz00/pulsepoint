/**
 * Roadmap module specifications — product truth for PulsePoint vs legacy AMS.
 * Used on coming-soon admin pages and planning docs. Live modules: work, members, events.
 */

import type { ProductId } from "@/lib/products";

export type RoadmapPhase = "M1" | "M2" | "M3" | "M4" | "M5" | "M6";

export type RoadmapModuleSpec = {
  id: ProductId;
  targetPhase: RoadmapPhase;
  headline: string;
  vision: string;
  userJobs: string[];
  capabilities: string[];
  vsProtech: string;
  dependencies: string[];
  successMetrics: string[];
  liveAlternative: string;
};

export const ROADMAP_MODULE_SPECS: Record<ProductId, RoadmapModuleSpec> = {
  work: {
    id: "work",
    targetPhase: "M1",
    headline: "Staff command center",
    vision: "One calm workspace—no hunting through nested menus.",
    userJobs: [
      "See what needs attention today",
      "Jump to live modules in one click",
      "Start common tasks from one home screen",
    ],
    capabilities: [
      "Role-aware home dashboard",
      "Quick actions to Members, Events, and Settings",
      "Same navigation pattern across every module",
    ],
    vsProtech: "Faster path to daily tasks; fewer clicks than legacy AMS home screens.",
    dependencies: ["Auth", "Org tenancy"],
    successMetrics: ["Median time-to-first-action < 30s for new staff"],
    liveAlternative: "PulsePoint Work is live in your tenant.",
  },
  members: {
    id: "members",
    targetPhase: "M1",
    headline: "Membership without spreadsheet chaos",
    vision: "Every member has one record—notes, tags, and history in one place.",
    userJobs: [
      "Find any member in seconds",
      "Import legacy data safely",
      "Export for board reports with audit trail",
    ],
    capabilities: [
      "Searchable directory with tags",
      "Staff notes (canonical, not custom fields)",
      "CSV stage → review → apply import",
      "ADMIN-gated export",
    ],
    vsProtech: "Staged imports vs blind uploads; modern search UX.",
    dependencies: ["Postgres tenant scope", "Audit log"],
    successMetrics: ["Import error rate < 1% rows rejected after review"],
    liveAlternative: "MemberCore is live in your tenant.",
  },
  events: {
    id: "events",
    targetPhase: "M1",
    headline: "Events from publish to check-in",
    vision: "Registration and revenue in one flow—staff and members stay oriented.",
    userJobs: [
      "Publish an event and share a public link",
      "Manage capacity and waitlist fairly",
      "Check in attendees on event day",
      "Collect payment when required",
    ],
    capabilities: [
      "Public registration pages",
      "Capacity / waitlist rules",
      "Stripe Checkout + webhook confirmation",
      "Check-in list for staff",
      "Registration state machine",
    ],
    vsProtech: "Lighter setup for common events; transparent waitlist and payment status.",
    dependencies: ["Stripe test/live", "Email soft-fail queue"],
    successMetrics: ["Zero double-charge incidents in pilot", "Check-in < 10s per attendee"],
    liveAlternative: "PulsePoint Events is live in your tenant.",
  },
  learn: {
    id: "learn",
    targetPhase: "M3",
    headline: "Education & certifications",
    vision: "CE credits and certificates tied to the member—not a separate silo.",
    userJobs: [
      "Track CE requirements per member",
      "Run learning paths for cohorts",
      "Issue certificates with audit history",
    ],
    capabilities: [
      "Credit types and rules engine",
      "Course / session catalog",
      "Completion + certificate PDF",
      "Transcript on member profile",
      "Optional link to Events for live sessions",
    ],
    vsProtech: "Unified member record vs bolt-on LMS modules with duplicate profiles.",
    dependencies: ["MemberCore", "Events optional"],
    successMetrics: ["Staff can pull CE transcript in < 3 clicks"],
    liveAlternative: "Use Events for live registrations today; Learn targets Month 3–4.",
  },
  giving: {
    id: "giving",
    targetPhase: "M4",
    headline: "Fundraising & donor management",
    vision: "Donors and members share context where appropriate—campaigns stay understandable.",
    userJobs: [
      "Track campaigns and appeals",
      "Record pledges and recurring gifts",
      "Acknowledge donors without manual mail merge",
    ],
    capabilities: [
      "Donor profile (link or separate from member)",
      "Campaigns and funds",
      "Gift batches + acknowledgment templates",
      "Simple giving dashboard",
    ],
    vsProtech: "Focused nonprofit flows without enterprise fundraising bloat for day-one staff.",
    dependencies: ["Commerce payments rail", "Engage email optional"],
    successMetrics: ["Gift entry < 2 min for staff", "Campaign totals match finance export"],
    liveAlternative: "Paid event registration via Stripe is live under Events.",
  },
  commerce: {
    id: "commerce",
    targetPhase: "M3",
    headline: "Dues, storefronts, and payments",
    vision: "Members pay in context—dues, merch, and event fees feel like one system.",
    userJobs: [
      "Sell membership dues online",
      "Run a simple storefront",
      "Reconcile revenue with finance",
    ],
    capabilities: [
      "Product catalog per org",
      "Cart + Stripe Checkout",
      "Invoices and receipt email",
      "Finance export (CSV / GL codes)",
      "Member purchase history",
    ],
    vsProtech: "Transparent pricing model; faster storefront setup than legacy commerce add-ons.",
    dependencies: ["Stripe", "MemberCore", "Finance export spec"],
    successMetrics: ["Dues renewal pilot with 50 members", "Finance reconciliation match within $0"],
    liveAlternative: "Event paid registration is live; full Commerce targets Month 3.",
  },
  engage: {
    id: "engage",
    targetPhase: "M4",
    headline: "Marketing & member communications",
    vision: "Segments from real member data—no CSV export to Mailchimp for routine sends.",
    userJobs: [
      "Email a segment (role, tag, event attendees)",
      "Use approved templates",
      "See send and bounce status",
    ],
    capabilities: [
      "Static + dynamic segments",
      "Template library with approval",
      "Campaign send + throttling",
      "Engagement metrics per campaign",
      "Suppression / unsubscribe compliance",
    ],
    vsProtech: "Native segments vs clunky marketing lists; honest send limits on prototype tier.",
    dependencies: ["MemberCore", "Email provider", "Audit log"],
    successMetrics: ["Campaign setup < 15 min for trained staff"],
    liveAlternative: "Registration confirmation email is live via Events.",
  },
  insights: {
    id: "insights",
    targetPhase: "M5",
    headline: "Dashboards & board-ready reporting",
    vision: "Leaders see the same numbers staff trust—no overnight Excel archaeology.",
    userJobs: [
      "View retention and event revenue trends",
      "Export board packet metrics",
      "Connect executive dashboards when IT is ready",
    ],
    capabilities: [
      "Executive KPI cards (tenant-scoped)",
      "Saved reports (members, events, revenue)",
      "CSV export + semantic layer docs",
      "BI embed / API (IT phase)",
    ],
    vsProtech: "Faster time-to-first dashboard; documented metric definitions.",
    dependencies: ["MemberCore", "Events", "Commerce for revenue metrics"],
    successMetrics: ["Board deck metrics match admin exports exactly"],
    liveAlternative: "Export member CSV and event lists from live modules today.",
  },
  crm: {
    id: "crm",
    targetPhase: "M2",
    headline: "Contact & pipeline management",
    vision: "Prospects, leads, and contacts in one place—no spreadsheet handoffs.",
    userJobs: [
      "Track prospects through a sales pipeline",
      "Capture leads from web forms",
      "Automate follow-up sequences",
    ],
    capabilities: [
      "Kanban-style workflow board",
      "Email sequences and automation",
      "Web form capture + auto-reply",
      "Lead-to-deal conversion",
    ],
    vsProtech: "Built-in pipeline vs Protech's add-on modules; no double data entry.",
    dependencies: ["MemberCore", "Engage email"],
    successMetrics: ["Lead-to-member conversion visible in one view"],
    liveAlternative: "CRM is live in alpha. Use pipelines and web forms today.",
  },
  deals: {
    id: "deals",
    targetPhase: "M3",
    headline: "Sponsorship & partnership development",
    vision: "Every sponsorship and partnership opportunity tracked from pitch to payment—no lost follow-ups.",
    userJobs: [
      "Track sponsorship and partnership negotiations",
      "Move opportunities through custom stages",
      "Report pipeline value for leadership",
    ],
    capabilities: [
      "Multiple partnership pipelines",
      "Drag-and-drop Kanban board",
      "Revenue forecasting cards",
      "Opportunity-to-member linkage",
    ],
    vsProtech: "Visual pipeline vs buried Protech contract records.",
    dependencies: ["CRM", "MemberCore"],
    successMetrics: ["Pipeline value visible without an Excel export"],
    liveAlternative: "Partnerships pipeline is live in alpha under CRM.",
  },
  advertising: {
    id: "advertising",
    targetPhase: "M5",
    headline: "Ad inventory & media kit",
    vision: "Sell newsletter ads, website placements, and event sponsorships in one system.",
    userJobs: [
      "Manage ad inventory and availability",
      "Issue proposals and invoices",
      "Track campaign performance",
    ],
    capabilities: [
      "Inventory calendar",
      "Media kit builder",
      "Advertiser portal",
      "Performance reporting",
    ],
    vsProtech: "Purpose-built for association advertising vs generic billing modules.",
    dependencies: ["Commerce", "Engage", "Insights"],
    successMetrics: ["Ad sold without leaving PulsePoint", "Zero overbooking incidents"],
    liveAlternative: "Track ad deals manually in the CRM pipeline today.",
  },
  advocacy: {
    id: "advocacy",
    targetPhase: "M2",
    headline: "Policy issues & take-action campaigns",
    vision:
      "Government affairs staff see priority issues, hospital participation, and grassroots responses in one workspace—not scattered spreadsheets.",
    userJobs: [
      "Track state and federal bills with clear status",
      "Launch take-action campaigns tied to member hospitals",
      "Report participation to leadership and the board",
      "Collect member facility impact data for sign-on letters",
    ],
    capabilities: [
      "Priority issue registry with jurisdiction and bill numbers",
      "Active campaign list with response targets",
      "Hospital engagement rollups from MemberCore",
      "PAC fundraising linked to priority issues (Preview via Giving)",
      "Audit-friendly export for board packets",
    ],
    vsProtech:
      "Purpose-built advocacy tracking vs generic CRM tasks; hospital participation visible without manual pivot tables.",
    dependencies: ["MemberCore", "Engage optional", "CRM relationships"],
    successMetrics: [
      "Campaign response rate visible within 24h of launch",
      "Issue status updated before weekly leadership standup",
    ],
    liveAlternative: "Advocacy is live in alpha under Enterprise AMS.",
  },
};

export const PHASE_LABELS: Record<RoadmapPhase, string> = {
  M1: "Months 1–2 — Live wedge",
  M2: "Month 2 — Pilot hardening",
  M3: "Months 3–4 — Revenue modules",
  M4: "Months 4–5 — Engagement & giving",
  M5: "Months 5–6 — Intelligence",
  M6: "Month 6 — Supervisor unveiling",
};
