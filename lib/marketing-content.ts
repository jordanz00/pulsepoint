/**
 * Long-form PulsePoint marketing copy — homepage and product narrative.
 * Pair with Live/Roadmap labels in UI; do not imply unshipped integrations are live.
 */

import type { CatalogStatus } from "@/lib/marketing-catalog";

export const HERO_COPY = {
  eyebrow: "Association Management Software",
  headline: "Modern AMS Built for Healthcare Associations",
  lead: "PulsePoint helps associations simplify operations, strengthen member engagement, and scale with confidence. Built on a modern, flexible platform, PulsePoint connects with your organization’s tools while delivering the performance and usability today’s teams expect.",
  bridge:
    "From membership management to events, education, reporting, and payments, PulsePoint provides what associations need in one connected platform—shipped modularly so you can start with MemberCore and PulsePoint Events today.",
} as const;

export const PLATFORM_INTRO = {
  title: "Core Platform Features",
  subtitle:
    "One platform narrative, modular delivery—see which capabilities are live in your tenant versus on the roadmap.",
} as const;

export type CoreFeature = {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
  pulseModule?: string;
};

export const CORE_PLATFORM_FEATURES: CoreFeature[] = [
  {
    id: "membership",
    title: "Membership Management",
    description:
      "Member directory, staff notes, audited CSV import (stage → review → apply), and role-based export—renewals and full portal on the roadmap.",
    status: "available",
    pulseModule: "MemberCore",
  },
  {
    id: "events",
    title: "Events, Sponsorships & Exhibits",
    description:
      "Plan events, registration, and onsite check-in today—sponsorships, exhibits, and booth management on the PulsePoint Events roadmap.",
    status: "available",
    pulseModule: "PulsePoint Events",
  },
  {
    id: "education",
    title: "Education & Certifications",
    description:
      "Certifications, CE credits, and professional development in one system—PulsePoint Learn on the roadmap.",
    status: "roadmap",
    pulseModule: "PulsePoint Learn",
  },
  {
    id: "fundraising",
    title: "Fundraising & Donor Management",
    description:
      "Donor profiles, campaigns, and giving workflows in one system—PulsePoint Giving on the roadmap.",
    status: "roadmap",
    pulseModule: "PulsePoint Giving",
  },
  {
    id: "payments",
    title: "E-Commerce & Payments",
    description:
      "Branded storefronts, dues, merchandise, and flexible payments—PulsePoint Commerce on the roadmap.",
    status: "roadmap",
    pulseModule: "PulsePoint Commerce",
  },
  {
    id: "communications",
    title: "Marketing & Communications",
    description:
      "Targeted campaigns, segmentation, and engagement metrics—PulsePoint Engage on the roadmap.",
    status: "roadmap",
    pulseModule: "PulsePoint Engage",
  },
  {
    id: "reporting",
    title: "Business Intelligence & Analytics",
    description:
      "Dashboards, role-based reporting, and unified visibility—PulsePoint Insights on the roadmap.",
    status: "roadmap",
    pulseModule: "PulsePoint Insights",
  },
  {
    id: "staff",
    title: "Staff Experience & Productivity",
    description:
      "Unified staff workspace, modern admin UX, and streamlined operations—PulsePoint Work (live for MemberCore + Events).",
    status: "available",
    pulseModule: "PulsePoint Work",
  },
];

export type CapabilityItem = {
  text: string;
  status: CatalogStatus;
};

/** Membership Management product narrative — branded MemberCore */
export const MEMBER_CORE_SPOTLIGHT = {
  category: "Membership Management",
  productName: "MemberCore",
  paragraphs: [
    "PulsePoint delivers a modern, intuitive membership experience that guides users from join to renewal through a streamlined, mobile-first journey.",
    "With simplified onboarding, single sign-on (SSO), and integrated billing, members can easily manage their entire lifecycle in one place. A clean, modern interface combined with automated membership and benefits management improves engagement, increases completion rates, and reduces manual work for staff.",
  ],
  roadmapNote:
    "SSO, integrated billing, and automated tier management are on the MemberCore roadmap—see labels below for what is live today.",
  portalTitle: "Members get 24/7 access to a personalized self-service portal where they can:",
  portalItems: [
    { text: "Join or renew memberships", status: "roadmap" },
    { text: "Pay dues and invoices", status: "roadmap" },
    { text: "Register for events", status: "available" },
    { text: "Manage profiles and preferences", status: "available" },
    { text: "Access member benefits and resources", status: "roadmap" },
  ] as CapabilityItem[],
  orgTitle: "With MemberCore, you can:",
  orgItems: [
    {
      text: "Deliver a streamlined, guided membership journey with fewer steps",
      status: "roadmap",
    },
    { text: "Launch a modern, customizable member portal", status: "available" },
    {
      text: "Automate membership tiers, benefits, and pricing",
      status: "roadmap",
    },
    {
      text: "Enable seamless self-service for dues, events, and purchases",
      status: "available",
    },
    { text: "Provide mobile-friendly, always-on member access", status: "available" },
    {
      text: "Simplify applications, renewals, and member management",
      status: "available",
    },
    {
      text: "Manage chapters, committees, and rosters in one system",
      status: "roadmap",
    },
  ] as CapabilityItem[],
} as const;

/** @deprecated Use MEMBER_CORE_SPOTLIGHT */
export const MEMBERSHIP_SPOTLIGHT = MEMBER_CORE_SPOTLIGHT;

/** Events, Sponsorships & Exhibits — PulsePoint Events */
export const PULSE_EVENTS_SPOTLIGHT = {
  category: "Events, Sponsorships & Exhibits",
  productName: "PulsePoint Events",
  paragraphs: [
    "PulsePoint Events gives associations everything they need to plan, manage, and deliver successful events—from registration through onsite check-in.",
    "PulsePoint Events streamlines the full event lifecycle while unlocking non-dues revenue through sponsorships and exhibits. Built-in tools for sessions, exhibitors, booths, and logistics make it easy to manage every detail in one connected system. A modern registration experience and fast onsite check-in reduce friction for attendees and lighten the workload for staff.",
  ],
  roadmapNote:
    "Sponsorships, exhibits, session tracks, templates, walk-in kiosks, and advanced pricing tiers are on the PulsePoint Events roadmap—see labels below for what is live today.",
  orgTitle: "With PulsePoint Events, you can:",
  orgItems: [
    {
      text: "Simplify event setup and attendee registration",
      status: "available",
    },
    {
      text: "Automate registrations, cancellations, and reporting",
      status: "roadmap",
    },
    {
      text: "Enable fast onsite check-in with self-service or staff-assisted kiosks",
      status: "available",
    },
    {
      text: "Register walk-in attendees, process payments, and print badges instantly",
      status: "roadmap",
    },
    {
      text: "Reuse event templates, sessions, pricing, and venue configurations",
      status: "roadmap",
    },
    {
      text: "Manage exhibitors, sponsorships, and booth assignments in one place",
      status: "roadmap",
    },
    {
      text: "Support complex pricing models, including tiers and early-bird rates",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Events helps your team run smoother, more profitable events while delivering a faster, more professional experience for attendees, sponsors, and exhibitors.",
} as const;

/** Education & Certifications — PulsePoint Learn (roadmap) */
export const PULSE_LEARN_SPOTLIGHT = {
  category: "Education & Certifications",
  productName: "PulsePoint Learn",
  paragraphs: [
    "PulsePoint Learn helps associations manage certifications, continuing education, and professional development in one unified system.",
    "PulsePoint Learn enables members to easily track their certifications, CE credits, and learning milestones while giving administrators clear visibility into engagement and progress. With a connected learning experience, associations can deliver structured education pathways, link learning to events and courses, and gain insights into what content drives the most participation.",
  ],
  roadmapNote:
    "PulsePoint Learn is on the PulsePoint roadmap—capabilities below will ship with the Learn module.",
  orgTitle: "With PulsePoint Learn, you can:",
  orgItems: [
    {
      text: "Track certifications, CE credits, and professional milestones in one member record",
      status: "roadmap",
    },
    {
      text: "Maintain a complete, accurate education history for every member",
      status: "roadmap",
    },
    {
      text: "Deliver a consistent learning experience through integrated learning systems",
      status: "roadmap",
    },
    {
      text: "Connect courses, certifications, and accreditation programs to events and offerings",
      status: "roadmap",
    },
    {
      text: "Analyze engagement trends to understand which topics drive member interest",
      status: "roadmap",
    },
    {
      text: "Align education programs with member development and organizational goals",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Learn helps associations modernize professional education while making it easier for members to grow, track progress, and stay certified.",
} as const;

/** Fundraising & Donor Management — PulsePoint Giving (roadmap) */
export const PULSE_GIVING_SPOTLIGHT = {
  category: "Fundraising & Donor Management",
  productName: "PulsePoint Giving",
  paragraphs: [
    "PulsePoint Giving helps associations support key initiatives through modern donor management and streamlined fundraising tools.",
    "PulsePoint Giving centralizes donor data, simplifies giving workflows, and helps teams build stronger, long-term supporter relationships. From recurring donations to campaigns and reporting, everything is managed in one connected system designed to reduce administrative overhead while improving donor engagement.",
  ],
  roadmapNote:
    "PulsePoint Giving is on the PulsePoint roadmap—capabilities below will ship with the Giving module.",
  orgTitle: "With PulsePoint Giving, you can:",
  orgItems: [
    {
      text: "Create detailed donor profiles and track all supporter interactions",
      status: "roadmap",
    },
    {
      text: "Enable recurring gifts, one-time donations, in-kind contributions, and auctions",
      status: "roadmap",
    },
    {
      text: "Launch targeted fundraising campaigns and automated donor acknowledgments",
      status: "roadmap",
    },
    {
      text: "Simplify payment processing with automated and manual invoicing options",
      status: "roadmap",
    },
    {
      text: "Track fundraising performance and generate real-time reports and insights",
      status: "roadmap",
    },
    {
      text: "Identify trends and opportunities to improve campaign effectiveness",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Giving helps associations increase fundraising efficiency, strengthen donor relationships, and gain clear visibility into revenue performance.",
} as const;

/** E-Commerce & Payments — PulsePoint Commerce (roadmap) */
export const PULSE_COMMERCE_SPOTLIGHT = {
  category: "E-Commerce & Payments",
  productName: "PulsePoint Commerce",
  paragraphs: [
    "PulsePoint Commerce provides a fully integrated e-commerce and payments experience designed for modern associations.",
    "PulsePoint Commerce enables organizations to launch branded online stores, streamline transactions, and offer members flexible, self-service purchasing options. From dues and event registrations to merchandise and digital offerings, all commerce activity is managed in one secure, unified platform.",
  ],
  roadmapNote:
    "PulsePoint Commerce is on the PulsePoint roadmap—paid event registration via Stripe in PulsePoint Events is live today; full storefronts, dues commerce, and the capabilities below ship with Commerce.",
  orgTitle: "With PulsePoint Commerce, you can:",
  orgItems: [
    {
      text: "Launch a polished, customizable online storefront for members",
      status: "roadmap",
    },
    {
      text: "Automate e-commerce workflows to reduce staff workload",
      status: "roadmap",
    },
    {
      text: "Offer promotions, discounts, and tiered pricing models",
      status: "roadmap",
    },
    {
      text: "Calculate shipping, taxes, and fees in real time",
      status: "roadmap",
    },
    {
      text: "Enable self-service purchasing with full member control over orders and payments",
      status: "roadmap",
    },
    {
      text: "Accept credit cards, ACH, digital wallets, and international payments",
      status: "roadmap",
    },
    {
      text: "Support flexible payment options, including installment-based plans",
      status: "roadmap",
    },
    {
      text: "Configure surcharges to offset processing costs",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Commerce helps associations simplify transactions, expand revenue opportunities, and deliver a seamless buying experience for members and stakeholders.",
} as const;

/** Marketing & Communications — PulsePoint Engage (roadmap) */
export const PULSE_ENGAGE_SPOTLIGHT = {
  category: "Marketing & Communications",
  productName: "PulsePoint Engage",
  paragraphs: [
    "PulsePoint Engage gives associations the tools to deliver personalized, data-driven communications across every member touchpoint.",
    "PulsePoint Engage connects member data with modern marketing workflows, making it easy to create targeted campaigns, automate outreach, and measure engagement. With powerful segmentation and seamless integrations, associations can deliver the right message to the right audience at the right time.",
  ],
  roadmapNote:
    "PulsePoint Engage is on the PulsePoint roadmap—capabilities below will ship with the Engage module.",
  orgTitle: "With PulsePoint Engage, you can:",
  orgItems: [
    {
      text: "Integrate with your preferred marketing automation and email platforms",
      status: "roadmap",
    },
    {
      text: "Send communications to individuals or large member groups directly from the system",
      status: "roadmap",
    },
    {
      text: "Build dynamic member segments based on membership type, behavior, or engagement activity",
      status: "roadmap",
    },
    {
      text: "Personalize messaging to improve relevance and response rates",
      status: "roadmap",
    },
    {
      text: "Track campaign performance, including opens, clicks, and engagement metrics",
      status: "roadmap",
    },
    {
      text: "Analyze communication effectiveness through integrated reporting tools",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Engage helps associations strengthen member relationships, improve communication efficiency, and drive higher engagement through smarter, more targeted outreach.",
} as const;

/** Business Intelligence & Analytics — PulsePoint Insights (roadmap) */
export const PULSE_INSIGHTS_SPOTLIGHT = {
  category: "Business Intelligence & Analytics",
  productName: "PulsePoint Insights",
  paragraphs: [
    "PulsePoint Insights gives associations real-time visibility into member data, organizational performance, and revenue drivers through powerful analytics and reporting tools.",
    "PulsePoint Insights transforms raw data into clear, actionable intelligence, helping teams make informed decisions across membership, events, fundraising, and engagement. With customizable dashboards and role-based reporting, every stakeholder gets the information they need without complexity.",
  ],
  roadmapNote:
    "PulsePoint Insights is on the PulsePoint roadmap—MemberCore CSV export and basic admin lists are available today; dashboards, exploration, and unified BI ship with Insights.",
  orgTitle: "With PulsePoint Insights, you can:",
  orgItems: [
    {
      text: "Create and share customizable dashboards across your organization",
      status: "roadmap",
    },
    {
      text: "Track membership trends, event performance, fundraising results, and engagement metrics in real time",
      status: "roadmap",
    },
    {
      text: "Visualize and explore data without leaving the platform",
      status: "roadmap",
    },
    {
      text: "Build role-based dashboards for staff, leadership, and departments",
      status: "roadmap",
    },
    {
      text: "Turn insights into action with clear, accessible reporting tools",
      status: "roadmap",
    },
    {
      text: "Improve decision-making with unified, organization-wide data visibility",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Insights helps associations move from fragmented reporting to a connected, data-driven approach that supports smarter strategy and better outcomes.",
} as const;

/** Staff Experience & Productivity — PulsePoint Work */
export const PULSE_WORK_SPOTLIGHT = {
  category: "Staff Experience & Productivity",
  productName: "PulsePoint Work",
  paragraphs: [
    "PulsePoint Work is designed to help association staff operate more efficiently with intuitive tools, streamlined workflows, and a modern user experience that reduces training time and improves day-to-day productivity.",
    "PulsePoint Work replaces complexity with clarity, giving teams a unified workspace to manage memberships, events, communications, and operations without switching between disconnected systems. Built for ease of use and speed, it helps staff accomplish more with less effort.",
  ],
  roadmapNote:
    "The PulsePoint admin workspace is live for MemberCore and PulsePoint Events today—deeper automation, cross-module billing/reporting workflows, and learning resources below expand on the PulsePoint Work roadmap.",
  orgTitle: "With PulsePoint Work, you can:",
  orgItems: [
    {
      text: "Deliver a clean, modern interface designed for fast adoption and minimal training",
      status: "available",
    },
    {
      text: "Streamline daily operations with intuitive workflows and automation",
      status: "available",
    },
    {
      text: "Reduce manual tasks across membership, events, billing, and reporting",
      status: "roadmap",
    },
    {
      text: "Improve staff productivity with a unified operational workspace",
      status: "available",
    },
    {
      text: "Enable consistent processes across departments and roles",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  ecosystemTitle:
    "PulsePoint Work is supported by a growing ecosystem of learning resources and peer collaboration tools, including:",
  ecosystemItems: [
    {
      text: "A searchable knowledge base with step-by-step guides and documentation",
      status: "roadmap",
    },
    {
      text: "Community-driven best practices and user feedback channels",
      status: "roadmap",
    },
    {
      text: "Regular product updates designed to continuously improve usability and performance",
      status: "roadmap",
    },
  ] as CapabilityItem[],
  closing:
    "PulsePoint Work helps association teams work faster, stay aligned, and focus more time on delivering value to members instead of managing systems.",
} as const;

export const BETTER_EXPERIENCES = {
  title: "Better Experiences for Members and Staff",
  lead: "PulsePoint helps associations create personalized, frictionless member experiences across every interaction.",
  membersTitle: "Members benefit from:",
  membersItems: [
    { text: "Faster support", status: "roadmap" },
    { text: "Secure self-service access", status: "available" },
    { text: "Personalized communications", status: "roadmap" },
    { text: "Mobile-friendly experiences", status: "available" },
    { text: "Simplified login with SSO", status: "roadmap" },
    { text: "Relevant event and content recommendations", status: "roadmap" },
  ] as CapabilityItem[],
  staffTitle: "Staff benefit from:",
  staffItems: [
    { text: "Real-time member insights", status: "available" },
    { text: "Reduced manual processes", status: "available" },
    { text: "Automated workflows", status: "roadmap" },
    { text: "Centralized reporting", status: "roadmap" },
    { text: "Easier day-to-day administration", status: "available" },
  ] as CapabilityItem[],
  closer:
    "The result is a more connected, efficient, and modern association experience for everyone involved.",
} as const;

export type FaqItem = { question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is association management software (AMS)?",
    answer:
      "Association management software (AMS) is a platform designed to help associations manage operations, member relationships, and organizational growth. AMS platforms typically include tools for membership management, dues and renewals, event registration, certifications and continuing education, reporting and analytics, communications and marketing, and e-commerce and payments. PulsePoint combines these capabilities into a unified, modern platform built specifically for healthcare associations—delivered in modules so you can adopt what you need when you need it.",
  },
  {
    question: "Why choose a modern AMS platform?",
    answer:
      "A modern AMS allows associations to centralize member data, automate repetitive tasks, and integrate with other business systems. With PulsePoint, organizations benefit from faster implementation and onboarding, continuous platform updates, improved security and scalability, modern APIs and integrations (roadmap), reduced administrative complexity, and better reporting and visibility across the organization as modules roll out.",
  },
  {
    question: "Is PulsePoint a CRM or an AMS?",
    answer:
      "PulsePoint combines the strengths of both. As a CRM-powered AMS, PulsePoint helps organizations manage member relationships while supporting association-specific workflows such as membership and dues management, chapter and committee administration (roadmap), certifications and credential tracking (roadmap), events and registrations, and communications and engagement (roadmap). This unified approach eliminates disconnected systems and gives teams a clearer view of member activity in one platform.",
  },
  {
    question: "Does PulsePoint support Power BI reporting?",
    answer:
      "PulsePoint Insights is being built for export-friendly reporting and Power BI–ready semantic layers (roadmap)—so teams can visualize member trends without a six-figure BI implementation. Today, use CSV export and dashboard placeholders in MemberCore and PulsePoint Events; full Power BI connectors will ship with PulsePoint Insights.",
  },
];
