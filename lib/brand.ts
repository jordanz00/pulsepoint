/**
 * PulsePoint brand copy — single source of truth
 */

export const BRAND_NAME = "PulsePoint";

export const TAGLINE = "The modern AMS built for healthcare associations";

export const ORIGIN_STORY =
  "Built by an association that got tired of paying millions for outdated software.";

export const DIFFERENTIATORS = [
  "Modern UI your staff actually likes using",
  "Faster than legacy AMS platforms",
  "AI-assisted workflows",
  "Lower implementation costs",
  "Easier reporting and exports",
  "Modular architecture",
  "Better member experience",
  "No bloated enterprise consulting cycle",
] as const;

export const BUILDER_ADVANTAGE = {
  headline: "Built by people who already run the work",
  body: "You're not starting from theory. You already know the workflows, the pain points, the politics, the reporting headaches, the implementation frustrations, and what admins actually need daily. That's extremely hard for random startups to replicate.",
  closer:
    "A lot of successful B2B SaaS starts exactly this way: we built it internally because existing software was painful and overpriced.",
} as const;

export const DESIGN_DIRECTION = {
  summary:
    "HAP corporate brand (April 2025): primary blue #0072bc, warm accent #fbb040, light blue #8ed8f8. Tahoma for UI copy, Montserrat for headlines. Clean association-grade dashboards—not cliché hospital clipart.",
  source: "HAP-Branding-Guidelines-April-2025-updated.pdf",
  references: ["HAP 340B dashboards", "Oliver Wyman report surfaces"] as const,
  avoid: "Off-brand navy/sky palettes; altering the HAP logo artwork",
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
