/**
 * PulsePoint brand copy — single source of truth
 */

export const BRAND_NAME = "PulsePoint";

export const TAGLINE =
  "Association Management Software for Hospital & Healthsystem Trade Associations";

export const ORIGIN_STORY =
  "Built for the way statewide hospital associations run membership, policy, education, and revenue—not retrofitted from generic AMS templates.";

export const DIFFERENTIATORS = [
  "Purpose-built for hospital trade associations and statewide rosters",
  "One member record: facility, contacts, advocacy, programs, and revenue",
  "Search-first—find any CEO, hospital, or at-risk member in seconds",
  "Advocacy and take-action tied to member hospitals, not spreadsheets",
  "Executive KPIs from the same database staff use daily",
  "Live and Preview labels—honest scope in product and contract",
  "Modular rollout—value before a multi-year implementation",
  "Modern workspace staff actually adopt",
] as const;

export const BUILDER_ADVANTAGE = {
  headline: "Built by people who already run the work",
  body: "You're not starting from theory. You already know the workflows, the pain points, the politics, the reporting headaches, the implementation frustrations, and what admins actually need daily. That's extremely hard for random startups to replicate.",
  closer:
    "A lot of successful B2B SaaS starts exactly this way: we built it internally because existing software was painful and overpriced.",
} as const;

export const DESIGN_DIRECTION = {
  summary:
    "Calm neutrals (#FAFAFA / #1D1D1F), single healthcare accent (#0A6E7C), system typography (-apple-system / SF Pro), generous radius and whitespace. User-centric, minimal chrome—compete on clarity vs legacy AMS density.",
  source: "lib/design-tokens.ts + app/globals.css",
  references: ["Apple Human Interface Guidelines (spacing, hierarchy)"] as const,
  avoid: "Employer-specific palettes; orange/warm corporate strips; cluttered data-dense tables without hierarchy",
} as const;

export const POSITIONING_VS_PROTECH = {
  headline: "Modern AMS for healthcare associations—without the legacy tax",
  pillars: [
    "Intuitive first: fewer clicks, obvious next steps",
    "Honest modular roadmap (Live vs coming soon)",
    "Lower TCO: no million-dollar implementation before value",
    "Tenant-safe by design (not bolted on later)",
  ],
} as const;

export const DOMAIN_STRATEGY = {
  ideal: "pulsepoint.com",
  realistic: [
    "pulsepointams.com",
    "getpulsepoint.com",
    "pulsepointhealth.com",
    "pulsepointplatform.com",
  ] as const,
} as const;
