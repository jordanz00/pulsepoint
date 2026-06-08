/**
 * Honest Protech comparison copy — marketing only; no false parity claims.
 * Sources: docs/PROTECH-FEATURE-MAP.md, docs/DEMO-GUIDE.md anti-patterns.
 */

export type CompareRow = {
  category: string;
  protech: string;
  pulsepoint: string;
  pulseStatus: "live" | "alpha" | "roadmap";
};

export const COMPARE_PROTECH_HEADLINE =
  "PulsePoint vs Protech — honest comparison for hospital associations";

export const COMPARE_PROTECH_LEAD =
  "Protech is the incumbent Microsoft Dynamics AMS many state hospital associations know. PulsePoint targets the daily staff wedge with modern UX, faster pilot scope, and deeper advocacy + workforce modules — without claiming 20 years of edge-case parity on day one.";

export const COMPARE_PROTECH_ROWS: CompareRow[] = [
  {
    category: "Membership & directory",
    protech: "Mature member lifecycle, directories, mobile app",
    pulsepoint: "MemberCore live — search, roles, import staging, MemberPulse",
    pulseStatus: "live",
  },
  {
    category: "Events & registration",
    protech: "Full conference ops, booths, badges, commerce tie-in",
    pulsepoint: "EventCore live — paid reg, check-in, sponsors; exhibit hall depth roadmap",
    pulseStatus: "live",
  },
  {
    category: "Advocacy & grassroots",
    protech: "Varies by implementation; often custom or third-party",
    pulsepoint: "Advocacy alpha — issue hub, take-action, Engage audiences, hospital roster KPIs",
    pulseStatus: "alpha",
  },
  {
    category: "CE & workforce",
    protech: "Education history on profile; LX365 analytics",
    pulsepoint: "Learn alpha — CE catalog, virtual career fair shell, pipeline programs",
    pulseStatus: "alpha",
  },
  {
    category: "Finance & GL",
    protech: "Deep accounting, Intacct/GP/Business Central integrations",
    pulsepoint: "Commerce alpha — products, orders, GL codes on SKUs; full GL sync roadmap",
    pulseStatus: "alpha",
  },
  {
    category: "Analytics",
    protech: "Power BI / LX365 embedded dashboards",
    pulsepoint: "Insights alpha — tenant KPIs, manual snapshots; PBI embed when IT ready",
    pulseStatus: "alpha",
  },
  {
    category: "Microsoft platform",
    protech: "Native Dynamics 365, AppSource certified, Copilot",
    pulsepoint: "M365 adapters alpha — Teams/Outlook path documented; not a Dynamics clone",
    pulseStatus: "alpha",
  },
  {
    category: "Migration",
    protech: "Long-tenured install base; familiar to association IT",
    pulsepoint: "Protech CSV import staging live — stress-tested path; no nightly sync claim",
    pulseStatus: "live",
  },
];

export const COMPARE_PROTECH_CLOSING =
  "Choose PulsePoint when you want a healthcare association platform built for advocacy depth, honest alpha labels, and a modern staff experience — and Protech when you need full Dynamics accounting parity today. We will tell you which is which in every demo.";
