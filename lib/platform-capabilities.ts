/**
 * Platform capability map — honest Live / Alpha / Roadmap labels for Fonteva-class scope.
 *
 * "live" = wedge GA (MemberCore + Events + Work). "alpha" = demo preview or partial UI.
 * See docs/PRODUCT-CLAIMS.md — do not mark alpha surfaces as live here.
 */

export type CapabilityStatus = "live" | "alpha" | "roadmap";

export type PlatformCapability = {
  id: string;
  label: string;
  status: CapabilityStatus;
  route?: string;
  notes: string;
};

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: "member-directory-core",
    label: "Member directory, staff notes, CSV export",
    status: "live",
    route: "/members",
    notes: "Tenant-scoped search, roles, ADMIN-gated export. Wedge GA.",
  },
  {
    id: "event-registration",
    label: "Published events, registration, check-in, paid checkout",
    status: "live",
    route: "/events",
    notes: "Capacity/waitlist, Stripe when configured; manual fallback in demo mode.",
  },
  {
    id: "staff-workspace",
    label: "Staff hub & automation exceptions queue",
    status: "live",
    route: "/work",
    notes: "Org routing, soft-fail exception workflow for async jobs.",
  },
  {
    id: "import-staging",
    label: "CSV import staging (review → apply)",
    status: "alpha",
    route: "/members/imports",
    notes: "Demo preview — not blind bulk insert or nightly Protech sync.",
  },
  {
    id: "member-360",
    label: "Member 360° profile & timeline",
    status: "alpha",
    route: "/members/[memberId]",
    notes: "Demo preview — aggregates events, orders, giving, CE, notes from seed data.",
  },
  {
    id: "engagement-scoring",
    label: "Engagement scoring & at-risk panel",
    status: "alpha",
    route: "/members/pulse",
    notes: "Rule-based score in demo; no ML or unattended scoring jobs.",
  },
  {
    id: "advocacy-issues",
    label: "Advocacy issues & take-action campaigns",
    status: "alpha",
    route: "/enterprise/advocacy",
    notes: "Issue/campaign CRUD, take-action launch, and public response form (alpha); legislative feed still roadmap.",
  },
  {
    id: "membership-analytics",
    label: "Membership analytics dashboard",
    status: "alpha",
    route: "/members/analytics",
    notes: "Tenant-scoped KPIs; board export and warehouse feeds are roadmap.",
  },
  {
    id: "event-conference",
    label: "Speakers, sponsors, sessions, public microsite",
    status: "alpha",
    route: "/events/[eventId]",
    notes: "Demo preview on event detail and /e/[slug] — not full conference ops automation.",
  },
  {
    id: "mobile-events",
    label: "Public event calendar (responsive web)",
    status: "alpha",
    route: "/calendar",
    notes: "Demo preview — iCal feed and list view; not native App Store apps.",
  },
  {
    id: "communities",
    label: "Private communities & collaboration",
    status: "alpha",
    route: "/communities",
    notes: "Alpha UI with seed spaces; not GA governance workflow.",
  },
  {
    id: "commerce-estore",
    label: "Public member store & product checkout",
    status: "alpha",
    route: "/store",
    notes: "Demo preview — Stripe, PayPal, Square, or manual adapters; not 100+ gateways.",
  },
  {
    id: "member-directory-public",
    label: "Public member directory",
    status: "alpha",
    route: "/directory",
    notes: "Demo preview — configurable fields when enabled on org.",
  },
  {
    id: "member-portal",
    label: "Self-service member portal",
    status: "alpha",
    route: "/portal",
    notes: "Email auto-link + portal hub, store checkout, invoice pay; Entra member SSO still roadmap.",
  },
  {
    id: "report-scheduling",
    label: "Insights KPI board & widget layout",
    status: "alpha",
    route: "/insights",
    notes: "Manual snapshot today — unattended scheduled email and BI embed are roadmap.",
  },
  {
    id: "renewal-workflows",
    label: "Renewal tiers & online dues pay",
    status: "alpha",
    route: "/join",
    notes: "Live join/renew checkout; Stripe webhook extends renewalDueAt. Cron reminders gated by PULSE_CRON_RENEWALS.",
  },
  {
    id: "fundraising-giving",
    label: "Fundraising campaigns & online gifts",
    status: "alpha",
    route: "/giving",
    notes: "Campaign CRUD, public /give checkout, offline gift entry, donor CSV export.",
  },
  {
    id: "auto-dues",
    label: "Automated subscriptions & billing jobs",
    status: "roadmap",
    notes: "MemberSubscription billing job not shipped for production tenants.",
  },
  {
    id: "native-mobile-apps",
    label: "Native iOS/Android event apps",
    status: "roadmap",
    notes: "Responsive web + calendar today; App Store apps not shipped.",
  },
];

export function capabilitiesByStatus(status: CapabilityStatus): PlatformCapability[] {
  return PLATFORM_CAPABILITIES.filter((c) => c.status === status);
}

/** Adapters shipped today — not a claim of 100+ live gateways. */
export function configuredGatewayAdapterCount(): number {
  return 4;
}
