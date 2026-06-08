/**
 * Enterprise integration registry — adapter targets (no secrets in repo).
 */

export type IntegrationStatus = "live" | "adapter_ready" | "planned" | "not_applicable";

export type IntegrationDefinition = {
  id: string;
  name: string;
  category: "identity" | "finance" | "crm" | "communications" | "analytics" | "events" | "education" | "legislative";
  status: IntegrationStatus;
  adapterPath?: string;
  notes: string;
};

export const INTEGRATION_REGISTRY: IntegrationDefinition[] = [
  {
    id: "microsoft_365",
    name: "Workspace & identity",
    category: "identity",
    status: "adapter_ready",
    adapterPath: "lib/adapters/microsoft365/",
    notes: "Entra SSO + Graph mail/calendar/contacts — /enterprise/integrations",
  },
  {
    id: "easydnn",
    name: "EasyDNN CMS",
    category: "events",
    status: "adapter_ready",
    adapterPath: "lib/adapters/cms/",
    notes: "DNN HTML module export for events + member directory",
  },
  {
    id: "teams",
    name: "Team collaboration",
    category: "communications",
    status: "planned",
    notes: "Meeting links for events; notification webhooks",
  },
  {
    id: "power_bi",
    name: "Executive dashboards",
    category: "analytics",
    status: "adapter_ready",
    notes: "CSV export + POWER-BI-SEMANTIC-LAYER.md; native embed on roadmap",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "finance",
    status: "live",
    adapterPath: "lib/adapters/payments/stripe.ts",
    notes: "Events + commerce checkout",
  },
  {
    id: "clerk",
    name: "Clerk",
    category: "identity",
    status: "live",
    adapterPath: "lib/adapters/auth/clerk.ts",
    notes: "Demo/staff auth; swap to enterprise SSO when ready",
  },
  {
    id: "resend",
    name: "Resend / SMTP",
    category: "communications",
    status: "live",
    adapterPath: "lib/adapters/email/",
    notes: "Engage sends; Azure Communication Services planned",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    status: "planned",
    notes: "Bi-directional contact sync — post wedge GA",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    status: "planned",
    notes: "Marketing automation bridge",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    category: "finance",
    status: "planned",
    notes: "GL + revenue recognition — finance module roadmap",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "finance",
    status: "planned",
    notes: "SMB finance export",
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "events",
    status: "planned",
    notes: "Webinar registration sync",
  },
  {
    id: "lms",
    name: "Learning Management System",
    category: "education",
    status: "planned",
    notes: "SCORM/xAPI or vendor API for Learn module",
  },
  {
    id: "legislative_tracker",
    name: "Legislative Tracking",
    category: "legislative",
    status: "adapter_ready",
    adapterPath: "lib/advocacy/legislative-tracker-adapter.ts",
    notes: "Adapter stub shipped; vendor feed not connected — returns empty bill list",
  },
  {
    id: "tableau",
    name: "Tableau",
    category: "analytics",
    status: "planned",
    notes: "Alternate BI embed",
  },
];
