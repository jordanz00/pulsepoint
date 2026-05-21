/**
 * Marketing page catalog — Protech-competitive structure, PulsePoint voice.
 * Status labels are honest (available vs roadmap); do not imply shipped modules.
 */

export type CatalogStatus = "available" | "roadmap";

export type MarketingPersona = {
  id: "members" | "leaders" | "staff";
  title: string;
  description: string;
  cta: string;
  productModule?: string;
};

export const ADVANCE_ASSOCIATION = {
  headline: "Advance your association",
  lead: "PulsePoint brings an integrated suite of member management, events, payments, communications, and analytics—without the legacy AMS price tag or implementation marathon.",
  sub: "Engage members, support leaders, and empower staff on one modular platform built for healthcare associations.",
} as const;

export const MARKETING_PERSONAS: MarketingPersona[] = [
  {
    id: "members",
    title: "Members",
    description:
      "Manage every step of the member journey—profiles, renewals, directories, and self-service portal access—in one intuitive workspace.",
    cta: "Explore MemberCore",
    productModule: "MemberCore",
  },
  {
    id: "leaders",
    title: "Leaders",
    description:
      "Give boards and executives clear visibility with dashboards, exports, and reporting designed for governance—not spreadsheet archaeology.",
    cta: "Explore PulsePoint Insights",
    productModule: "PulsePoint Insights",
  },
  {
    id: "staff",
    title: "Staff",
    description:
      "Equip your team with a modern UI they will actually use—fast workflows, role-based access, and modules that grow with your association.",
    cta: "See the platform",
    productModule: "PulsePoint platform",
  },
];

export type AmsFeature = {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
  pulseModule?: string;
};

/** Feature grid aligned with familiar AMS categories (Protech-style IA) */
export const AMS_FEATURE_CATALOG: AmsFeature[] = [
  {
    id: "membership",
    title: "Membership",
    description:
      "Gain insights from your data to personalize the member experience—profiles, tags, renewals, and directories.",
    status: "available",
    pulseModule: "MemberCore",
  },
  {
    id: "meetings-events",
    title: "Meetings & Events",
    description:
      "Expedite conferences, registrations, CME programs, check-in, and paid events through your AMS.",
    status: "available",
    pulseModule: "PulsePoint Events",
  },
  {
    id: "education",
    title: "Education & Certifications",
    description:
      "Certifications, CE credits, and learning milestones in one member record (PulsePoint Learn — roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Learn",
  },
  {
    id: "fundraising",
    title: "Fundraising & Donor Management",
    description:
      "Donor profiles, campaigns, and recurring gifts in one system (PulsePoint Giving — roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Giving",
  },
  {
    id: "ecommerce",
    title: "E-Commerce & Payments",
    description:
      "Branded storefronts, dues, merchandise, and member self-service purchasing (PulsePoint Commerce — roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Commerce",
  },
  {
    id: "accounting",
    title: "Accounting",
    description:
      "Process transactions and maintain accurate financial records integrated with Commerce (roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Commerce",
  },
  {
    id: "marketing",
    title: "Marketing & Communications",
    description:
      "Targeted campaigns, segmentation, and engagement metrics (PulsePoint Engage — roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Engage",
  },
  {
    id: "bi",
    title: "Business Intelligence & Analytics",
    description:
      "Dashboards, role-based reporting, and unified data visibility (PulsePoint Insights — roadmap).",
    status: "roadmap",
    pulseModule: "PulsePoint Insights",
  },
];

export const SOCIAL_PROOF = {
  headline: "Built for member-based healthcare organizations",
  sub: "Associations—not generic SaaS—running modern operations without million-dollar legacy contracts.",
} as const;

export const QUICK_TOUR = {
  headline: "See PulsePoint in action",
  lead: "Curious what modern association management software looks like when it is not stuck in 2010?",
  cta: "Start your free organization",
  secondary: "Book a walkthrough",
} as const;

export const SALES_CTAS = {
  bookCall: {
    label: "Book a call",
    href: process.env.NEXT_PUBLIC_SALES_CALENDAR_URL ?? "mailto:hello@pulsepointams.com?subject=PulsePoint%20demo",
  },
  requestDemo: {
    label: "Request a demo",
    href: "/sign-up",
  },
} as const;
