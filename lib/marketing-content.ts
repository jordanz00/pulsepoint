/**
 * Long-form PulsePoint marketing copy — homepage and product narrative.
 * Pair with Live/Roadmap labels in UI; do not imply unshipped integrations are live.
 */

import type { CatalogStatus } from "@/lib/marketing-catalog";

export const HERO_COPY = {
  eyebrow: "Modern AMS for healthcare associations",
  headline: "Run your entire association from one platform—without the legacy AMS tax",
  lead:
    "PulsePoint unifies membership, events, learning, giving, commerce, and staff operations in a single workspace—with honest Live and Preview labels on every module.",
  bridge:
    "Start with modules that are live today; add previews when you are ready. No surprise scope in the contract.",
} as const;

export const VS_LEGACY_COPY = {
  title: "What we do better",
  lead:
    "You get the work of a full association system—members, events, and staff tools—with a interface people actually enjoy using.",
  pillars: [
    {
      title: "Easier day to day",
      body: "Fewer clicks to add a member, publish an event, or fix a problem. Plain words, not software jargon.",
    },
    {
      title: "Honest roadmap",
      body: "Live means your team can rely on it today. Coming soon means we have not promised it in your contract yet.",
    },
    {
      title: "Built to trust",
      body: "Each association's data stays separate. Imports are reviewed before they go live. Payments and emails that fail show up for staff to handle.",
    },
  ],
} as const;

export const PLATFORM_INTRO = {
  title: "Everything in one platform",
  subtitle:
    "Pick the pieces you need. Green Live badges are ready now; Coming soon is clearly marked.",
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
    title: "MemberCore",
    description:
      "Search your directory, import a spreadsheet safely, and keep notes on one screen per person.",
    status: "available",
    pulseModule: "MemberCore",
  },
  {
    id: "events",
    title: "Events",
    description:
      "Publish an event, share a registration link, check people in, and collect payment when you need it.",
    status: "available",
    pulseModule: "PulsePoint Events",
  },
  {
    id: "education",
    title: "Learning & credits",
    description: "Track classes and continuing education on each member's record.",
    status: "alpha",
    pulseModule: "PulsePoint Learn",
  },
  {
    id: "fundraising",
    title: "Fundraising",
    description: "Run campaigns and record gifts in one place.",
    status: "alpha",
    pulseModule: "PulsePoint Giving",
  },
  {
    id: "payments",
    title: "Online payments",
    description: "Sell dues or items through a simple checkout.",
    status: "alpha",
    pulseModule: "PulsePoint Commerce",
  },
  {
    id: "communications",
    title: "Email to members",
    description: "Send updates to the right groups without exporting lists.",
    status: "alpha",
    pulseModule: "PulsePoint Engage",
  },
  {
    id: "reporting",
    title: "Reports & charts",
    description: "See how membership and events are performing, and download spreadsheets.",
    status: "alpha",
    pulseModule: "PulsePoint Insights",
  },
  {
    id: "staff",
    title: "Staff workspace",
    description: "The same calm layout across every module so training stays short.",
    status: "available",
    pulseModule: "PulsePoint Work",
  },
];

export type CapabilityItem = {
  text: string;
  status: CatalogStatus;
};

/** Membership & Member Experience — branded MemberCore */
export const MEMBER_CORE_SPOTLIGHT = {
  category: "Membership & Member Experience",
  productName: "MemberCore",
  paragraphs: [
    "Create a seamless, modern experience for every member lifecycle stage — from application to renewal.",
    "PulsePoint provides intuitive member portals, streamlined onboarding, self-service account management, and mobile-friendly workflows that reduce administrative overhead while improving engagement.",
  ],
  roadmapNote:
    "Labels below show what is live in your tenant today versus on the roadmap.",
  portalTitle: "Features include:",
  portalItems: [
    { text: "Guided membership applications and renewals", status: "roadmap" },
    { text: "Personalized member dashboards", status: "roadmap" },
    { text: "Self-service dues and payment management", status: "roadmap" },
    { text: "Role-based member access", status: "available" },
    { text: "Committee, chapter, and roster management", status: "roadmap" },
    { text: "Automated renewal reminders and workflows", status: "roadmap" },
    { text: "Secure single sign-on (SSO)", status: "roadmap" },
  ] as CapabilityItem[],
  orgTitle: "With MemberCore, you can:",
  orgItems: [
    { text: "Find any member in seconds with search and tags", status: "available" },
    { text: "Keep staff notes and history on one member record", status: "available" },
    { text: "Import members with stage → review → apply", status: "available" },
    { text: "Export audited member CSV for reporting", status: "available" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Event registration and ticketing", status: "available" },
    { text: "Sponsor and exhibitor management", status: "roadmap" },
    { text: "Session scheduling", status: "roadmap" },
    { text: "Attendance tracking", status: "available" },
    { text: "Registration confirmation email", status: "available" },
    { text: "Automated event reminders", status: "roadmap" },
    { text: "Real-time reporting and revenue tracking", status: "roadmap" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Certification lifecycle management", status: "roadmap" },
    { text: "CE/CME credit tracking", status: "roadmap" },
    { text: "Course enrollment workflows", status: "roadmap" },
    { text: "Expiration and renewal automation", status: "roadmap" },
    { text: "Progress dashboards for members and staff", status: "roadmap" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Donation processing", status: "roadmap" },
    { text: "Campaign and appeal management", status: "roadmap" },
    { text: "Donor segmentation", status: "roadmap" },
    { text: "Recurring giving programs", status: "roadmap" },
    { text: "Contribution history and reporting", status: "roadmap" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Online payments and invoicing", status: "roadmap" },
    { text: "Recurring billing support", status: "roadmap" },
    { text: "Secure payment processing", status: "available" },
    { text: "Product and resource sales", status: "roadmap" },
    { text: "Integrated checkout experiences", status: "roadmap" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Email campaign management", status: "roadmap" },
    { text: "Segmented audience targeting", status: "roadmap" },
    { text: "Automated notifications and reminders", status: "roadmap" },
    { text: "Member engagement tracking", status: "roadmap" },
    { text: "Communication history and activity logs", status: "available" },
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
  orgTitle: "Features include:",
  orgItems: [
    { text: "Custom dashboards and reports", status: "roadmap" },
    { text: "Membership analytics", status: "roadmap" },
    { text: "Revenue and financial reporting", status: "roadmap" },
    { text: "Event performance insights", status: "roadmap" },
    { text: "Exportable operational data", status: "available" },
    { text: "Executive-level KPI tracking", status: "roadmap" },
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

/** Built for Security, Reliability & Scale — synced with SECURITY_MARKETING on homepage */
export const SECURITY_PLATFORM_SPOTLIGHT = {
  category: "Member data, protected.",
  productName: "Platform foundation",
  paragraphs: [
    "Hospital associations trust PulsePoint with roster, payment, and engagement information. Each organization gets its own private space—imports are reviewed before they land, and problems surface for staff to fix.",
  ],
  roadmapNote: "",
  orgTitle: "What you can count on:",
  orgItems: [
    {
      text: "Separate private data space for every association",
      status: "available",
    },
    {
      text: "Role-based access—staff only see permitted screens and exports",
      status: "available",
    },
    {
      text: "Validated workflows for member and event records",
      status: "available",
    },
    {
      text: "Automated checks to reduce cross-organization data exposure",
      status: "available",
    },
    {
      text: "Spreadsheet uploads reviewed before production data changes",
      status: "available",
    },
    {
      text: "Payments and registrations processed once—no silent double charges",
      status: "available",
    },
  ] as CapabilityItem[],
  closing: "",
} as const;

/** Why Organizations Choose PulsePoint */
export const WHY_ORGANIZATIONS_CHOOSE = {
  title: "Why associations switch to PulsePoint",
  paragraphs: [
    "Your staff should not need a manual the size of a phone book to update a member or open registration.",
    "PulsePoint is shaped by people who run association work every day—so the screens match how you actually work.",
    "You get one place for members and events now, with room to add learning, fundraising, and reporting when those modules are ready for you.",
  ],
} as const;

/** PulsePoint at a Glance — synced with GLANCE_MARKETING + lib/glance-marketing-preview.ts */
export const PULSE_AT_A_GLANCE = {
  title: "PulsePoint at a Glance",
  designedFor: [
    "Statewide hospital associations",
    "Health system member networks",
    "Government affairs & PAC teams",
    "IT and web operations",
  ],
  supports: [
    { text: "MemberCore directory & renewals", status: "available" as CatalogStatus },
    { text: "EventCore registration & export", status: "available" as CatalogStatus },
    { text: "Staff workspace & integrations", status: "available" as CatalogStatus },
    { text: "Advocacy, giving, insights & more", status: "alpha" as CatalogStatus },
    { text: "Microsoft 365 + EasyDNN handoff", status: "available" as CatalogStatus },
  ],
  builtWith: [
    "Separate data space for each association",
    "Spreadsheet imports reviewed before go-live",
    "Safe payment and registration handling",
    "Clear staff screens when something needs attention",
    "Modern, fast web experience",
  ],
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

export type FaqItem = {
  question: string;
  answer: string;
  bullets?: readonly string[];
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is PulsePoint?",
    answer:
      "Cloud AMS for hospital associations—membership, advocacy, events, and revenue on one platform.",
  },
  {
    question: "Who is it for?",
    answer:
      "Statewide hospital and health system associations—facility rosters, GR, and C-suite workflows.",
  },
  {
    question: "What makes it different?",
    answer:
      "PulsePoint puts your whole association on one platform—built for statewide hospital associations, not generic chapter software.",
    bullets: [
      "MemberCore — one hospital roster for every module",
      "EventCore — registration, check-in, and payments",
      "Advocacy — policy campaigns tied to who acted",
      "Insights — board-ready revenue from the same data staff uses",
      "Hospital PAC — fundraising linked to policy priorities",
      "Microsoft 365, EasyDNN, and Stripe — connected, not replaced",
    ],
  },
  {
    question: "What's live today?",
    answer: "MemberCore, events, and staff workspace. Other modules show Preview until GA.",
  },
  {
    question: "Does PulsePoint handle our PAC?",
    answer:
      "PAC fundraising runs through Giving (Preview)—goals, contributions, and issue-linked reporting beside Advocacy. Compliance filings stay with counsel; PulsePoint tracks pacing and ties dollars to policy priorities.",
  },
  {
    question: "How is data protected?",
    answer:
      "We treat your member data as sensitive—and security is something we work on every day, not something we set once and forget. Safeguards are in place so your association's information stays private, access stays controlled, and protections keep improving as standards evolve.",
    bullets: [
      "Protection built into the platform from the start",
      "Security practices reviewed and strengthened on an ongoing basis",
      "We will walk through details with your IT team and counsel before go-live",
    ],
  },
  {
    question: "Does PulsePoint work with Microsoft 365?",
    answer:
      "Yes. PulsePoint is built to plug into the Microsoft 365 your staff already use—the same work accounts, the same Outlook mail and calendar—so membership work and Microsoft tools feel like one environment, not two systems fighting each other.",
    bullets: [
      "Sign in with Microsoft — staff use their existing work accounts, no extra passwords",
      "Outlook mail, calendar, and contacts show inside PulsePoint for everyday work",
      "Connected through your organization's Microsoft account—the way enterprise tools are meant to integrate",
      "Your IT team approves the connection once; we keep it current as Microsoft updates",
    ],
  },
  {
    question: "We run EasyDNN on our public website. How does that connect?",
    answer:
      "Configure your DNN site URL in Enterprise → Integrations. Export event pages and member directory as HTML modules to paste into EasyDNN—registration stays on PulsePoint with Stripe.",
  },
  {
    question: "What does pricing look like?",
    answer:
      "Modular—start with live modules (MemberCore, events, workspace) and add previews when ready. Request a demo for a quote sized to your roster and integrations.",
  },
];
