/**
 * Marketing homepage copy — plain language, honest Live / Preview labels.
 * See docs/PRODUCT-CLAIMS.md for claim guardrails (internal; not shown on the site).
 */

import type { CatalogStatus } from "@/lib/marketing-catalog";
import type { ProductId } from "@/lib/products";
import {
  STATEWIDE_HOSPITAL_MEMBER_COUNT,
  STATEWIDE_HOSPITAL_MEMBERSHIP_LINE,
} from "@/lib/marketing-constants";
import { PAC_GOAL_PCT } from "@/lib/pac-marketing-preview";

export { STATEWIDE_HOSPITAL_MEMBER_COUNT, STATEWIDE_HOSPITAL_MEMBERSHIP_LINE };

export const MARKETING_HERO = {
  productTagline: "For hospital associations",
  headline: "See your association clearly.",
  subhead:
    "One platform for membership, advocacy, PAC fundraising, events, and revenue—built for statewide hospital rosters.",
  valuePills: ["Microsoft 365 ready", "EasyDNN website export", "Board-ready KPIs"] as const,
  ctaPrimary: "Open interactive demo",
  ctaSecondary: "Talk to our team",
  trustLine: "Sample data in previews · Live & Preview on every screen",
  demoLabel: "Try it now — no login",
  demoCaption: "",
} as const;

export const LEADERSHIP_STATS = [
  {
    id: "hospitals",
    value: STATEWIDE_HOSPITAL_MEMBER_COUNT,
    prefix: "",
    suffix: "",
    label: "Your roster",
    impact: "Every facility tied to advocacy, events, and revenue",
    productId: "members" as const,
  },
  {
    id: "modules",
    value: 12,
    prefix: "",
    suffix: "",
    label: "Connected programs",
    impact: "One spine—not a dozen disconnected tools",
    productId: "work" as const,
  },
  {
    id: "renewal",
    value: 94,
    prefix: "",
    suffix: "%",
    label: "Renewal health",
    impact: "Spot at-risk members before the board asks",
    productId: "insights" as const,
  },
  {
    id: "revenue",
    value: 284,
    prefix: "$",
    suffix: "K",
    label: "Revenue MTD",
    impact: "Same number in staff ops and your board deck",
    productId: "commerce" as const,
  },
] as const;

export const LEADERSHIP_PROMISE = {
  eyebrow: "Executive snapshot",
  headline: "",
  lead: "",
  pillars: [] as const,
} as const;

/** Unified enterprise + integrations marketing — IT / webmaster audience */
export const ENTERPRISE_INTEGRATIONS_MARKETING = {
  eyebrow: "For IT & web teams",
  headline: "Your stack stays. PulsePoint plugs in.",
  lead: "Microsoft 365, EasyDNN, and Stripe stay put. Import the roster once, paste event pages, export board numbers—no rip-and-replace.",
  demoHref: "/demo-healthcare/enterprise/integrations",
  demoLabel: "Open integrations workspace",
  outcomes: [
    {
      id: "website",
      title: "Website stays put",
      body: "Your webmaster pastes PulsePoint HTML into EasyDNN. Members keep the same site they trust.",
      proof: "No CMS migration—generate HTML, paste in DNN, link registration back to PulsePoint.",
      itNote: "Typical page handoff: minutes after URL is configured",
      icon: "events" as FeatureMatrixIcon,
      productId: "events" as const,
      features: ["EasyDNN HTML export", "Event pages", "Member directory", "Same site URL"],
    },
    {
      id: "microsoft",
      title: "Microsoft stays put",
      body: "Staff sign in with work accounts. Outlook mail and calendar show inside PulsePoint.",
      proof: "Documented Entra + Graph path—no parallel password list for IT to maintain.",
      itNote: "See IT-HANDOFF.md · ENTRA-PILOT-SETUP.md",
      icon: "work" as FeatureMatrixIcon,
      productId: "work" as const,
      features: ["Entra sign-in", "Outlook in-app", "Graph scopes listed", "Pilot profile ready"],
    },
    {
      id: "data",
      title: "Data moves once",
      body: "Import members from CSV. Export the same totals for board decks and Power BI import.",
      proof: "Roster feeds events, email, and reports—staff stop retyping the same names.",
      itNote: "ADMIN-gated exports · tenant isolation · continuity scripts",
      icon: "insights" as FeatureMatrixIcon,
      productId: "insights" as const,
      features: ["CSV roster import", "Power BI CSV export", "Stripe receipts", "Per-org database"],
    },
  ],
  itReassurances: [
    "Public site stays on EasyDNN—we supply HTML your webmaster pastes",
    "Staff keep Microsoft work accounts—Entra pilot path documented for IT",
    "Roster imports via CSV with duplicate review before data goes live",
    "Each association gets its own isolated data space and role-based access",
    "Backup and export scripts IT can schedule—see continuity runbook",
  ],
  footnote:
    "You keep Microsoft 365 and EasyDNN. PulsePoint connects them—you do not replace what already works.",
  disclaimer: "Power BI embed and full member SSO are roadmap · pilot Entra path ships today",
} as const;

/** @deprecated Use ENTERPRISE_INTEGRATIONS_MARKETING — kept for section aliases */
export const PLATFORM_INTEGRATIONS = {
  eyebrow: "Integrations",
  headline: ENTERPRISE_INTEGRATIONS_MARKETING.headline,
  lead: ENTERPRISE_INTEGRATIONS_MARKETING.lead,
  reassurances: ENTERPRISE_INTEGRATIONS_MARKETING.itReassurances,
  integrations: [] as const,
  footnote: ENTERPRISE_INTEGRATIONS_MARKETING.footnote,
} as const;

export const SECURITY_MARKETING = {
  eyebrow: "Trust & security",
  headline: "Member data, protected.",
  lead: "Private space per association, role-based access, and reviewed imports—issues surface for staff to fix, not silently in production.",
  footnote:
    "Built for membership and operations—not clinical records. Protected health information stays out of scope.",
  disclaimer: "Not a substitute for counsel on PAC or HIPAA scope decisions.",
} as const;

export const GLANCE_MARKETING = {
  eyebrow: "Summary",
  headline: "PulsePoint at a Glance",
  lead: "Statewide hospital associations—one roster, twelve modules, and honest Live and Preview labels on every screen.",
  footnote:
    "Built for membership and operations—not clinical records. Every preview uses sample data clearly labeled in the UI.",
} as const;

export const EVENTS_MARKETING = {
  eyebrow: "EventCore",
  headline: "Programs that publish to your site.",
  lead: "Registration, check-in, and revenue—plus one-click EasyDNN HTML export for your public events page.",
  capabilities: [
    "Stripe checkout and capacity limits on public registration",
    "Speakers, sponsors, and agenda in the export bundle",
    "EasyDNN HTML module—paste into DNN, link back to PulsePoint registration",
    "Member directory export for your association website",
  ],
  demoHref: "/demo-healthcare/events",
  demoLabel: "Open EventCore demo",
} as const;

/** @deprecated Use ENTERPRISE_INTEGRATIONS_MARKETING */
export const ENTERPRISE_STACK_MARKETING = {
  eyebrow: "Enterprise stack",
  headline: ENTERPRISE_INTEGRATIONS_MARKETING.headline,
  lead: ENTERPRISE_INTEGRATIONS_MARKETING.lead,
  workflows: [] as const,
  footnote: ENTERPRISE_INTEGRATIONS_MARKETING.footnote,
} as const;

/** Homepage explainer — plain language for CEOs; no hidden tabs */
export const WHAT_IS_PULSEPOINT = {
  eyebrow: "Plain-English overview",
  headline: "What is PulsePoint?",
  lead: "The modern AMS for statewide hospital associations—one roster, one revenue picture, one advocacy view.",
  pillars: [
    {
      id: "roster",
      label: "One roster",
      value: STATEWIDE_HOSPITAL_MEMBER_COUNT,
      suffix: "",
      detail: "Hospitals on one spine",
      productId: "members" as const,
    },
    {
      id: "revenue",
      label: "One revenue view",
      value: 284,
      prefix: "$",
      suffix: "K",
      detail: "Dues + events + giving",
      productId: "insights" as const,
    },
    {
      id: "trust",
      label: "Honest scope",
      value: 100,
      suffix: "%",
      detail: "Live & Preview on every screen",
      productId: "work" as const,
    },
  ],
  cards: [
    {
      id: "what",
      label: "What is it?",
      title: "Your AMS—unified",
      body: "Membership, advocacy, PAC, events, and revenue in one workspace—not ten tools and a spreadsheet.",
      impact: "Staff, finance, and government relations pull from the same hospital record.",
      productId: "work" as const,
    },
    {
      id: "does",
      label: "What it does",
      title: "Run the association",
      body: "Directory, registration, dues, campaigns, and board KPIs—searchable, exportable, auditable.",
      impact: "Answer board questions in minutes, not after a week in Excel.",
      productId: "insights" as const,
    },
    {
      id: "who",
      label: "Built for",
      title: "Hospital associations",
      body: "Statewide facility rosters, GR workflows, and C-suite reporting—not generic chapter-based AMS.",
      impact: `You know your ${STATEWIDE_HOSPITAL_MEMBER_COUNT} hospitals. PulsePoint shows who needs attention.`,
      productId: "members" as const,
    },
    {
      id: "why",
      label: "Why PulsePoint",
      title: "Clarity you can defend",
      body: "Every KPI ties to a member or transaction. Every module is labeled Live or Preview—no surprise scope.",
      impact: "Walk into the board meeting with numbers your team already trusts.",
      productId: "advocacy" as const,
    },
  ],
  spineModules: [
    { name: "MemberCore", tag: "Roster", productId: "members" as const, icon: "members" as const },
    { name: "EventCore", tag: "Programs", productId: "events" as const, icon: "events" as const },
    { name: "Advocacy", tag: "Policy", productId: "advocacy" as const, icon: "advocacy" as const },
    { name: "Insights", tag: "Revenue", productId: "insights" as const, icon: "insights" as const },
    { name: "Engage", tag: "Outreach", productId: "engage" as const, icon: "communications" as const },
    { name: "Commerce", tag: "Dues", productId: "commerce" as const, icon: "commerce" as const },
  ],
} as const;

export const MEMBERCORE_MARKETING = {
  eyebrow: "MemberCore",
  headline: "The roster everything else runs on.",
  lead: "Directory, MemberPulse engagement, roles, and Member 360°—one record per organization so staff stop hunting spreadsheets and leadership trusts the numbers.",
  statHighlight: {
    value: STATEWIDE_HOSPITAL_MEMBER_COUNT,
    label: "members on roster",
    context: "Demo association · statewide hospital membership",
  },
  outcomes: [
    {
      id: "directory",
      title: "Directory that scales",
      body: "Search, filter, import, and export—by name, role, tier, facility type, or engagement.",
      proof: "Bulk edit, CSV import review, and audited export when the board asks for the list.",
      icon: "members" as FeatureMatrixIcon,
      productId: "members" as const,
      features: ["Smart search", "Role filters", "CSV import", "Audited export"],
    },
    {
      id: "engagement",
      title: "MemberPulse engagement",
      body: "Scores and tiers from events, dues, advocacy, and email—see who needs outreach before renewal.",
      proof: "At-risk queue on Home and directory—act while membership is still saveable.",
      icon: "insights" as FeatureMatrixIcon,
      productId: "members" as const,
      features: ["Engagement tiers", "At-risk queue", "Renewal status", "Pulse dimensions"],
    },
    {
      id: "roles",
      title: "Roles & Member 360°",
      body: "C-suite, board, and committee titles on the same profile as events, orders, and gifts.",
      proof: "One timeline across EventCore, Commerce, Giving, and Engage—no swivel-chair CRM.",
      icon: "crm" as FeatureMatrixIcon,
      productId: "crm" as const,
      features: ["Role taxonomy", "Member 360°", "Staff notes", "Portal link"],
    },
  ],
  proofStrip: [
    "Live module — directory, pulse, and export ship today",
    "Tenant-scoped roster with org isolation",
    "Feeds Insights, Events, Advocacy, and portal",
  ],
  demoHref: "/demo-healthcare/members",
  demoLabel: "Explore MemberCore",
  disclaimer: "Illustrative sample · demo workspace",
} as const;

export const ADVOCACY_MARKETING = {
  eyebrow: "PulsePoint Advocacy",
  headline: "Government affairs, orchestrated.",
  lead: "Priority issues, bill tracking, and take-action campaigns—connected to the member roster your GR team already maintains. One workflow from alert to board briefing.",
  statHighlight: {
    value: 428,
    label: "take-action responses",
    context: "Demo association · grassroots sample period",
  },
  outcomes: [
    {
      id: "issues",
      title: "Issue & bill intelligence",
      body: "State and federal priorities with status, bill numbers, and agenda weight—ready for leadership review.",
      proof: "Board sees the same issue stack your GR team monitors—not a slide deck rebuilt every quarter.",
      icon: "advocacy" as FeatureMatrixIcon,
      productId: "advocacy" as const,
      features: ["Priority issues", "Bill tracking", "Agenda mix", "Jurisdiction tags"],
    },
    {
      id: "campaigns",
      title: "Grassroots mobilization",
      body: "Sign-on letters, surveys, and legislator briefings—with response counts against roster targets.",
      proof: "Know which campaigns are gaining traction before the legislative session moves on.",
      icon: "communications" as FeatureMatrixIcon,
      productId: "engage" as const,
      features: ["Take-action flows", "Response targets", "Deadline tracking", "Engage integration"],
    },
    {
      id: "roster",
      title: "Roster-linked participation",
      body: "See which members and executives responded—tied to MemberCore, not a separate contact list.",
      proof: "Participation rolls up by organization so coalitions and PAC asks use the same spine.",
      icon: "members" as FeatureMatrixIcon,
      productId: "members" as const,
      features: ["Member engagement", "Executive outreach", "PAC alignment", "Coalition view"],
    },
  ],
  proofStrip: [
    "Alpha preview — core GR workflows in demo",
    "Issues and campaigns tie to MemberCore roster",
    "PAC fundraising links to active priorities (see Hospital PAC band)",
  ],
  demoHref: "/demo-healthcare/enterprise/advocacy",
  demoLabel: "Explore Advocacy",
  disclaimer: "Illustrative sample · alpha preview · not your association",
} as const;

/** Hospital PAC — political fundraising tied to government affairs */
export const PAC_MARKETING = {
  eyebrow: "Hospital PAC",
  headline: "Board-ready PAC report.",
  lead: "Three questions every board asks—on pace, who gave, what fights—answered on one interactive report tied to Advocacy.",
  statHighlight: {
    value: PAC_GOAL_PCT,
    suffix: "%",
    label: "of board PAC goal",
    context: "Sample cycle · $186K raised of $250K goal",
  },
  outcomes: [
    {
      id: "pacing",
      title: "Know if you're on pace",
      body: "One bar shows dollars raised vs the goal your board approved. No guessing before a leadership meeting.",
      proof: "Board sees YTD progress and state-vs-Congress split in plain numbers.",
      icon: "fundraising" as FeatureMatrixIcon,
      productId: "giving" as const,
      features: ["YTD raised", "Board goal", "Pace bar", "State vs Congress"],
    },
    {
      id: "hospitals",
      title: "See who gave",
      body: "Member hospital PAC gifts roll up in one list—linked to MemberCore, not a side spreadsheet.",
      proof: "Know which health systems are carrying the PAC before you ask for more.",
      icon: "members" as FeatureMatrixIcon,
      productId: "members" as const,
      features: ["Hospital totals", "Executive gifts", "Roster link", "Quick compare"],
    },
    {
      id: "policy",
      title: "Fund the right fights",
      body: "PAC dollars tie to Advocacy issues—state bills, federal bills, and the lawmakers you're backing.",
      proof: "Political money follows policy priorities, not a disconnected wish list.",
      icon: "advocacy" as FeatureMatrixIcon,
      productId: "advocacy" as const,
      features: ["Issue-linked PAC", "Statehouse", "Congress", "Lawmaker touchpoints"],
    },
  ],
  proofStrip: [
    "Preview sample — not a government filing or FEC report",
    "PAC totals link to PulsePoint Advocacy priorities",
    "Live political fundraising needs counsel sign-off first",
  ],
  demoHref: "/demo-healthcare/giving",
  demoLabel: "Explore PAC workspace",
  disclaimer: "Illustrative sample · preview only · coordinate with counsel before live PAC",
} as const;

/** Association platform spine — AMS + CRM marketing band (one source of truth). */
export const ASSOCIATION_SPINE_MARKETING = {
  eyebrow: "One platform",
  headline: "Membership, revenue, and outreach—connected.",
  lead: "Associations run on relationships, programs, and follow-through. PulsePoint keeps all three on the same member record—so staff stop re-entering data and leadership stops waiting for reconciled reports.",
  spineStart: "MemberCore",
  spineEnd: "Insights",
  lanes: [
    {
      id: "roster",
      title: "Know your members",
      summary: "Directory, roles, engagement, and renewal status—searchable in one roster.",
      modules: ["MemberCore"] as const,
      productId: "members" as const,
      icon: "members" as FeatureMatrixIcon,
      spineStep: "Engagement",
      signals: [
        { id: "active", label: "Active members", pct: 78 },
        { id: "moderate", label: "Moderate engagement", pct: 16 },
        { id: "attention", label: "Needs attention", pct: 6 },
      ],
    },
    {
      id: "revenue",
      title: "Run programs that fund the mission",
      summary: "Events, dues, and contributions roll into totals leadership can cite.",
      modules: ["EventCore", "Commerce", "Giving", "Insights"] as const,
      productId: "insights" as const,
      icon: "insights" as FeatureMatrixIcon,
      spineStep: "Revenue",
      signals: [
        { id: "dues", label: "Membership dues", pct: 58 },
        { id: "programs", label: "Programs & events", pct: 27 },
        { id: "giving", label: "Contributions", pct: 15 },
      ],
    },
    {
      id: "outreach",
      title: "Stay in touch between touchpoints",
      summary: "Email, forms, and pipeline activity tied to the people on your roster.",
      modules: ["Engage", "CRM"] as const,
      productId: "engage" as const,
      icon: "communications" as FeatureMatrixIcon,
      spineStep: "Outreach",
      signals: [
        { id: "email", label: "Email reach", pct: 71 },
        { id: "forms", label: "Form capture", pct: 52 },
        { id: "pipeline", label: "Partner pipeline", pct: 38 },
      ],
    },
  ],
  disclaimer: "Illustrative sample · demo workspace",
  demoHref: "/demo-healthcare",
  demoLabel: "Platform Demo",
} as const;

/** @deprecated Use ASSOCIATION_SPINE_MARKETING */
export const AMS_CRM_POSITIONING = {
  headline: ASSOCIATION_SPINE_MARKETING.headline,
  lead: ASSOCIATION_SPINE_MARKETING.lead,
  pillars: ASSOCIATION_SPINE_MARKETING.lanes.map((lane) => ({
    title: lane.title,
    body: lane.summary,
    tools: lane.modules.join(" · "),
  })),
} as const;

export const INSIGHTS_MARKETING = {
  eyebrow: "PulsePoint Insights",
  headline: "One truth for leadership.",
  lead: "Membership, programs, and revenue roll up from the roster your team updates every day—no spreadsheet reconciliation, no million-dollar BI project.",
  outcomes: [
    {
      id: "revenue",
      title: "Revenue command center",
      body: "MTD total, dues vs non-dues mix, and trend—fed by Commerce, Events, and Giving.",
      proof: "Board asks for this first. Your staff already captured the underlying transactions.",
      icon: "insights" as FeatureMatrixIcon,
      productId: "insights" as const,
    },
    {
      id: "renewals",
      title: "Renewal radar",
      body: "Current, lapsed, and at-risk members before renewal season—not after the board meeting.",
      proof: "Engagement tiers and renewal dates live in MemberCore, not a side spreadsheet.",
      icon: "members" as FeatureMatrixIcon,
      productId: "members" as const,
    },
    {
      id: "exports",
      title: "Defensible exports",
      body: "CSV snapshots and audit trail—numbers leadership can repeat without a second source.",
      proof: "Every export logs who pulled what. Same figures your team sees in the console.",
      icon: "work" as FeatureMatrixIcon,
      productId: "work" as const,
    },
  ],
  proofStrip: [
    "One database for staff and executives",
    "Alpha today · scheduled email reports on roadmap",
    "Honest Live vs Preview labels on every module",
  ],
  demoHref: "/demo-healthcare/insights",
  demoLabel: "See Insights demo",
  disclaimer: "Sample workspace · illustrative data · not your association",
} as const;

/** @deprecated Use INSIGHTS_MARKETING — kept for catalog references */
export const ANALYTICS_SHOWCASE = {
  headline: INSIGHTS_MARKETING.headline,
  lead: INSIGHTS_MARKETING.lead,
  bullets: INSIGHTS_MARKETING.outcomes.map((o) => o.title),
} as const;

/** Hospital marketing band — minimal copy; visuals in enterprise-healthcare-section. */
export const ENTERPRISE_HEALTHCARE = {
  badge: "Healthcare",
  headline: "Built for hospital associations",
  tagline: "Roster · revenue · policy",
  modules: [
    {
      id: "members",
      name: "MemberCore",
      tag: "Roster",
      icon: "members" as FeatureMatrixIcon,
      tone: "members" as const,
      statValue: STATEWIDE_HOSPITAL_MEMBER_COUNT,
      statLabel: "Hospitals",
      statPrefix: "",
      statSuffix: "",
    },
    {
      id: "insights",
      name: "Insights",
      tag: "Revenue",
      icon: "insights" as FeatureMatrixIcon,
      tone: "insights" as const,
      statValue: 284,
      statLabel: "MTD",
      statPrefix: "$",
      statSuffix: "K",
    },
    {
      id: "events",
      name: "EventCore",
      tag: "Programs",
      icon: "events" as FeatureMatrixIcon,
      tone: "events" as const,
      statValue: 12,
      statLabel: "Live events",
      statPrefix: "",
      statSuffix: "",
    },
    {
      id: "engage",
      name: "Engage",
      tag: "Outreach",
      icon: "communications" as FeatureMatrixIcon,
      tone: "engage" as const,
      statValue: 96,
      statLabel: "Open rate",
      statPrefix: "",
      statSuffix: "%",
    },
  ],
  ctaLabel: "Platform Demo",
  ctaHref: "/demo-healthcare/members",
} as const;

export type FeatureMatrixIcon =
  | "members"
  | "events"
  | "education"
  | "fundraising"
  | "commerce"
  | "communications"
  | "insights"
  | "work"
  | "crm"
  | "deals"
  | "advertising"
  | "advocacy";

export type HeroPreviewTile = {
  id: string;
  productId: ProductId;
  module: string;
  title: string;
  subtitle: string;
  status: "live" | "preview";
  icon: FeatureMatrixIcon;
};

/** Hero mock — all 12 suite modules; each tile uses its own canonical productId + icon tone. */
export const HERO_PREVIEW_TILES: HeroPreviewTile[] = [
  {
    id: "work",
    productId: "work",
    module: "Work",
    title: "Staff hub",
    subtitle: "One workspace across every module",
    status: "live",
    icon: "work",
  },
  {
    id: "members",
    productId: "members",
    module: "MemberCore",
    title: "Member directory",
    subtitle: "Search, roles, and engagement",
    status: "live",
    icon: "members",
  },
  {
    id: "crm",
    productId: "crm",
    module: "CRM",
    title: "Relationships",
    subtitle: "Contacts and web capture",
    status: "preview",
    icon: "crm",
  },
  {
    id: "deals",
    productId: "deals",
    module: "Partnerships",
    title: "Sponsorship pipeline",
    subtitle: "Forecast and executive dashboards",
    status: "preview",
    icon: "deals",
  },
  {
    id: "events",
    productId: "events",
    module: "EventCore",
    title: "Programs & registration",
    subtitle: "Publish, pay, and check-in",
    status: "live",
    icon: "events",
  },
  {
    id: "advertising",
    productId: "advertising",
    module: "Ad ops",
    title: "Campaigns & sync",
    subtitle: "NPI checks and MLR workflow",
    status: "preview",
    icon: "advertising",
  },
  {
    id: "learn",
    productId: "learn",
    module: "Learn",
    title: "CE & courses",
    subtitle: "Completions on the member profile",
    status: "preview",
    icon: "education",
  },
  {
    id: "giving",
    productId: "giving",
    module: "Giving",
    title: "Fundraising",
    subtitle: "Campaigns and gifts tied to members",
    status: "preview",
    icon: "fundraising",
  },
  {
    id: "commerce",
    productId: "commerce",
    module: "Commerce",
    title: "Dues & checkout",
    subtitle: "Orders and member store",
    status: "preview",
    icon: "commerce",
  },
  {
    id: "engage",
    productId: "engage",
    module: "Engage",
    title: "Member email",
    subtitle: "Audiences built from live data",
    status: "preview",
    icon: "communications",
  },
  {
    id: "insights",
    productId: "insights",
    module: "Insights",
    title: "Revenue & KPIs",
    subtitle: "Board KPIs and snapshots",
    status: "preview",
    icon: "insights",
  },
  {
    id: "advocacy",
    productId: "advocacy",
    module: "Advocacy",
    title: "Policy & take action",
    subtitle: "Issues, bills, and hospital coalitions",
    status: "preview",
    icon: "advocacy",
  },
];

export const HERO_PREVIEW_KPIS: {
  id: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  delta: string;
  productId: ProductId;
}[] = [
  { id: "members", label: "Hospitals", value: STATEWIDE_HOSPITAL_MEMBER_COUNT, prefix: "", suffix: "", delta: "Statewide roster", productId: "members" },
  { id: "revenue", label: "Revenue MTD", value: 284, prefix: "$", suffix: "K", delta: "+8% vs last", productId: "insights" },
  { id: "dues", label: "Unpaid dues", value: 24, prefix: "$", suffix: "K", delta: "6 invoices", productId: "commerce" },
  { id: "events", label: "Events live", value: 12, prefix: "", suffix: "", delta: "3 this week", productId: "events" },
  { id: "risk", label: "At-risk members", value: 18, prefix: "", suffix: "", delta: "Outreach queue", productId: "deals" },
];

/** Membership mix segments map to distinct module colors on marketing previews. */
export const HERO_PREVIEW_MEMBERSHIP_MIX: {
  general: { pct: number; productId: ProductId };
  associate: { pct: number; productId: ProductId };
  other: { pct: number; productId: ProductId };
} = {
  general: { pct: 49, productId: "work" },
  associate: { pct: 38, productId: "crm" },
  other: { pct: 13, productId: "advertising" },
};

export const HERO_PREVIEW_ACTIVITY: {
  id: string;
  label: string;
  detail: string;
  productId: ProductId;
}[] = [
  {
    id: "1",
    label: "Dues payment posted",
    detail: "Commerce · GL-coded product",
    productId: "giving",
  },
  {
    id: "2",
    label: "Member list export completed",
    detail: "Audit log · compliance ready",
    productId: "engage",
  },
  {
    id: "3",
    label: "Summit registration revenue synced",
    detail: "Events · tied to member CRM",
    productId: "learn",
  },
  {
    id: "4",
    label: "Spring sign-on letter · 142 hospitals",
    detail: "Advocacy · take-action campaign",
    productId: "advocacy",
  },
];

export type FeatureMatrixItem = {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
  module: string;
  icon: FeatureMatrixIcon;
};

export const FEATURE_MATRIX: FeatureMatrixItem[] = [
  {
    id: "membership",
    title: "MemberCore",
    description: "Directory, staged imports, staff notes—one profile per hospital.",
    status: "available",
    module: "MemberCore",
    icon: "members",
  },
  {
    id: "events",
    title: "Events",
    description: "Publish, register, check-in, and collect payment in one flow.",
    status: "available",
    module: "PulsePoint Events",
    icon: "events",
  },
  {
    id: "work",
    title: "Staff workspace",
    description: "One navigation pattern across all modules—short onboarding.",
    status: "available",
    module: "PulsePoint Work",
    icon: "work",
  },
  {
    id: "education",
    title: "Learning & credits",
    description:
      "Track courses and continuing education on the member record—ready when your Learn module is enabled.",
    status: "alpha",
    module: "PulsePoint Learn",
    icon: "education",
  },
  {
    id: "fundraising",
    title: "Fundraising",
    description:
      "Run campaigns and record gifts with the same member spine finance and development both trust.",
    status: "alpha",
    module: "PulsePoint Giving",
    icon: "fundraising",
  },
  {
    id: "commerce",
    title: "Online payments",
    description:
      "Sell dues and products through checkout with orders tied back to members—not a disconnected cart.",
    status: "alpha",
    module: "PulsePoint Commerce",
    icon: "commerce",
  },
  {
    id: "communications",
    title: "Email to members",
    description:
      "Build audiences from live member data and send updates without exporting lists to another tool.",
    status: "alpha",
    module: "PulsePoint Engage",
    icon: "communications",
  },
  {
    id: "insights",
    title: "Reports & charts",
    description: "Board KPIs and revenue breakdowns from live data.",
    status: "alpha",
    module: "PulsePoint Insights",
    icon: "insights",
  },
  {
    id: "advocacy",
    title: "Advocacy & policy",
    description: "Bills, issues, and take-action—tied to your roster.",
    status: "alpha",
    module: "PulsePoint Advocacy",
    icon: "advocacy",
  },
];

export const WHAT_MAKES_IT_DIFFERENT = {
  eyebrow: "Why PulsePoint",
  headline: "What makes it different?",
  headlineAccent: "One spine. Zero spreadsheet archaeology.",
  lead: "Your hospital roster, programs, policy work, revenue, and PAC—connected in plain sight. Every number labeled Live or Preview.",
  headlineStats: [
    {
      id: "roster",
      value: STATEWIDE_HOSPITAL_MEMBER_COUNT,
      prefix: "",
      suffix: "",
      label: "Hospitals",
      detail: "One roster every module reads",
      productId: "members" as const,
    },
    {
      id: "modules",
      value: 12,
      prefix: "",
      suffix: "",
      label: "Modules",
      detail: "Connected on one spine",
      productId: "work" as const,
    },
    {
      id: "labeled",
      value: 100,
      prefix: "",
      suffix: "%",
      label: "Scope labeled",
      detail: "Live or Preview on every screen",
      productId: "insights" as const,
    },
    {
      id: "stack",
      value: 3,
      prefix: "",
      suffix: "",
      label: "Integrations",
      detail: "Microsoft · EasyDNN · Stripe",
      productId: "work" as const,
    },
  ],
  offers: [
    {
      id: "members",
      title: "MemberCore",
      body: "One hospital roster—search, export, and see who is engaged.",
      statValue: STATEWIDE_HOSPITAL_MEMBER_COUNT,
      statLabel: "hospitals on roster",
      bento: "hero" as const,
      sparkline: [38, 44, 41, 52, 58, 55, 63, 68, 72] as const,
      productId: "members" as const,
    },
    {
      id: "advocacy",
      title: "Advocacy",
      body: "Bills, issues, and take-action—tied to your full roster.",
      statValue: 428,
      statLabel: "take-action responses",
      bento: "hero" as const,
      sparkline: [12, 18, 22, 28, 35, 42, 48, 55, 62] as const,
      productId: "advocacy" as const,
    },
    {
      id: "events",
      title: "EventCore",
      body: "Registration, check-in, and event payments in one place.",
      statValue: 12,
      statLabel: "live events",
      bento: "cell" as const,
      sparkline: [20, 24, 22, 30, 28, 34, 32, 38] as const,
      productId: "events" as const,
    },
    {
      id: "insights",
      title: "Insights",
      body: "Dues, events, and giving totals leadership can trust.",
      statValue: 284,
      statPrefix: "$",
      statSuffix: "K",
      statLabel: "revenue MTD",
      bento: "cell" as const,
      sparkline: [48, 52, 50, 58, 62, 60, 68, 72] as const,
      productId: "insights" as const,
    },
    {
      id: "pac",
      title: "Hospital PAC",
      body: "Fundraising and policy priorities in the same workspace.",
      statValue: 74,
      statSuffix: "%",
      statLabel: "of PAC goal",
      bento: "cell" as const,
      sparkline: [40, 44, 48, 52, 58, 62, 68, 74] as const,
      productId: "giving" as const,
    },
    {
      id: "stack",
      title: "Your existing tools",
      body: "Microsoft sign-in, EasyDNN website, and Stripe payments—connected.",
      statValue: 4,
      statLabel: "steps to go live",
      bento: "strip" as const,
      sparkline: [25, 50, 75, 100] as const,
      productId: "work" as const,
    },
  ],
  rows: [
    {
      id: "roster",
      legacy: "A different hospital list in every module",
      pulse: "One record—from dues to take-action",
      pulseHighlight: "1 roster",
      chart: [
        { id: "legacy", label: "Duplicate hospital lists", pct: 78, tone: "muted" as const },
        { id: "pulse", label: "Single MemberCore record", pct: 100, tone: "brand" as const },
      ],
    },
    {
      id: "board",
      legacy: "Board numbers rebuilt in Excel every month",
      pulse: "Revenue and roster totals staff already use",
      pulseHighlight: "Same DB",
      chart: [
        { id: "legacy", label: "Manual spreadsheet rebuild", pct: 92, tone: "muted" as const },
        { id: "pulse", label: "Live totals from staff ops", pct: 100, tone: "brand" as const },
      ],
    },
    {
      id: "advocacy",
      legacy: "Advocacy tracked in a side spreadsheet",
      pulse: "See which hospitals have not acted yet",
      pulseHighlight: "Roster-linked",
      chart: [
        { id: "legacy", label: "Offline GR tracking", pct: 65, tone: "muted" as const },
        { id: "pulse", label: "Take-action on roster", pct: 100, tone: "brand" as const },
      ],
    },
    {
      id: "scope",
      legacy: "Hard to tell what is live vs promised",
      pulse: "Every screen labeled Live or Preview",
      pulseHighlight: "100% labeled",
      chart: [
        { id: "legacy", label: "Unclear product scope", pct: 40, tone: "muted" as const },
        { id: "pulse", label: "Honest Live / Preview badges", pct: 100, tone: "brand" as const },
      ],
    },
  ],
  closing:
    "Built for statewide hospital associations—not generic chapter software with hospital features bolted on.",
  disclaimer: "Illustrative sample · demo association scale · not your association's live data",
} as const;

export const VS_LEGACY = {
  headline: WHAT_MAKES_IT_DIFFERENT.headline,
  lead: WHAT_MAKES_IT_DIFFERENT.lead,
  offers: WHAT_MAKES_IT_DIFFERENT.offers,
  rows: WHAT_MAKES_IT_DIFFERENT.rows,
  closing: WHAT_MAKES_IT_DIFFERENT.closing,
} as const;

export const DEMO_CTA = {
  headline: "Ready when you are.",
  lead: `${STATEWIDE_HOSPITAL_MEMBERSHIP_LINE}. Open the demo—no login.`,
  walkthrough: "Guided tour (~50 min)",
  suite: "Full suite",
} as const;

/** Section intros — shared copy for marketing section headers */
export const MARKETING_SECTIONS = {
  suite: {
    eyebrow: "Platform",
    title: "12 modules. One spine.",
    lead: "Hover to explore. Every module shares the same member record.",
  },
  features: {
    eyebrow: "Modules",
    title: "What each one does",
    lead: "Hover for live sample charts. Live ships today; Preview is labeled.",
  },
  platform: {
    eyebrow: "Workspace",
    title: "One admin experience",
    lead: "",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Quick answers",
    lead: "Plain language. No jargon.",
  },
  different: {
    eyebrow: WHAT_MAKES_IT_DIFFERENT.eyebrow,
    title: WHAT_MAKES_IT_DIFFERENT.headline,
    lead: WHAT_MAKES_IT_DIFFERENT.lead,
  },
  integrations: {
    eyebrow: ENTERPRISE_INTEGRATIONS_MARKETING.eyebrow,
    title: ENTERPRISE_INTEGRATIONS_MARKETING.headline,
    lead: ENTERPRISE_INTEGRATIONS_MARKETING.lead,
  },
} as const;
