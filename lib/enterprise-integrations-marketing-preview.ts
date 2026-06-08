/**
 * Illustrative enterprise integration preview — IT handoff paths (sample).
 */

import type { ProductId } from "@/lib/products";

export type EnterpriseIntegrationFocus = "website" | "microsoft" | "data";

export type IntegrationPreviewCard = {
  id: string;
  title: string;
  body: string;
  statusLabel: string;
  statusTone: "live" | "pilot" | "export" | "shipped";
  productId: ProductId;
  itDetail: string;
};

export const ENTERPRISE_GO_LIVE_STEPS = [
  {
    id: "entra",
    step: "1",
    title: "Connect Microsoft sign-in",
    detail: "Entra app registration · same work accounts staff use today",
    statusLabel: "Pilot ready",
    statusTone: "pilot" as const,
    productId: "work" as const,
  },
  {
    id: "dnn",
    step: "2",
    title: "Point your EasyDNN site",
    detail: "Save your DNN URL in Integrations — no site rebuild",
    statusLabel: "Shipped",
    statusTone: "shipped" as const,
    productId: "events" as const,
  },
  {
    id: "import",
    step: "3",
    title: "Import member roster",
    detail: "Upload CSV · staff review duplicates before apply",
    statusLabel: "Shipped",
    statusTone: "shipped" as const,
    productId: "members" as const,
  },
  {
    id: "launch",
    step: "4",
    title: "Publish & paste",
    detail: "Event live · HTML module on your site · Stripe when ready",
    statusLabel: "Shipped",
    statusTone: "shipped" as const,
    productId: "commerce" as const,
  },
] as const;

/** Checklist copy shown when a go-live step is selected in the marketing handoff card. */
export const HANDOFF_STEP_DETAILS: Record<
  (typeof ENTERPRISE_GO_LIVE_STEPS)[number]["id"],
  { summary: string; checklist: readonly { label: string; done: boolean }[] }
> = {
  entra: {
    summary: "Staff sign in with Microsoft work accounts—Entra app registration documented for IT.",
    checklist: [
      { label: "Register Entra app + redirect URI", done: true },
      { label: "Staff SSO with work account", done: true },
      { label: "Graph read: mail + calendar", done: true },
    ],
  },
  dnn: {
    summary: "Your public site stays on EasyDNN. PulsePoint generates HTML your webmaster pastes.",
    checklist: [
      { label: "Save DNN site URL in Integrations", done: true },
      { label: "Generate HTML on event Website tab", done: true },
      { label: "Paste into EasyDNN HTML module", done: true },
      { label: "Registration stays on PulsePoint + Stripe", done: true },
    ],
  },
  import: {
    summary: "Import the roster once. Staff review duplicates before anything goes live.",
    checklist: [
      { label: "Upload member CSV", done: true },
      { label: "Review duplicate matches", done: true },
      { label: "Apply to live roster", done: true },
    ],
  },
  launch: {
    summary: "Publish events, paste site modules, turn on Stripe when counsel approves.",
    checklist: [
      { label: "Event published in PulsePoint", done: true },
      { label: "HTML live on member site", done: true },
      { label: "Stripe checkout + webhooks", done: true },
    ],
  },
};

/** Compact status chips — marketing handoff card only (not full integration grid). */
export const HANDOFF_SYSTEM_CHIPS = [
  { id: "microsoft", label: "Microsoft 365", statusLabel: "Pilot ready", statusTone: "pilot" as const, productId: "work" as const },
  { id: "easydnn", label: "EasyDNN", statusLabel: "Shipped", statusTone: "shipped" as const, productId: "events" as const },
  { id: "stripe", label: "Stripe", statusLabel: "Live", statusTone: "live" as const, productId: "commerce" as const },
  { id: "powerbi", label: "Power BI", statusLabel: "CSV export", statusTone: "export" as const, productId: "insights" as const },
] as const;

export const INTEGRATION_PREVIEW_CARDS: IntegrationPreviewCard[] = [
  {
    id: "entra",
    title: "Sign in with Microsoft",
    body: "Staff use Entra work accounts — documented pilot path for IT.",
    statusLabel: "Pilot ready",
    statusTone: "pilot",
    productId: "work",
    itDetail: "docs/ENTRA-PILOT-SETUP.md",
  },
  {
    id: "m365",
    title: "Microsoft 365",
    body: "Outlook mail and calendar read inside PulsePoint via Graph.",
    statusLabel: "Pilot ready",
    statusTone: "pilot",
    productId: "engage",
    itDetail: "Mail.Read · Calendars.Read · Contacts.Read",
  },
  {
    id: "easydnn",
    title: "EasyDNN website",
    body: "Copy HTML modules into DNN — events and member directory.",
    statusLabel: "Shipped",
    statusTone: "shipped",
    productId: "events",
    itDetail: "Paste-in export · no live CMS API required",
  },
  {
    id: "powerbi",
    title: "Power BI",
    body: "CSV exports with stable metric keys — import mode today.",
    statusLabel: "Export ready",
    statusTone: "export",
    productId: "insights",
    itDetail: "Embed on roadmap · pnpm continuity:export",
  },
  {
    id: "stripe",
    title: "Stripe payments",
    body: "Event fees and dues checkout with webhook receipts.",
    statusLabel: "Live",
    statusTone: "live",
    productId: "commerce",
    itDetail: "Signature-verified webhooks · idempotent",
  },
  {
    id: "email",
    title: "Member email",
    body: "Send to lists built from your live roster — not a stale sheet.",
    statusLabel: "Live",
    statusTone: "live",
    productId: "engage",
    itDetail: "Resend / SMTP adapter · tenant-scoped lists",
  },
];

export const WEBSITE_PREVIEW_FLOW = [
  { label: "Build event in PulsePoint", done: true },
  { label: "Generate EasyDNN HTML module", done: true },
  { label: "Webmaster pastes into DNN page", done: true },
  { label: "Registration stays on PulsePoint + Stripe", done: true },
] as const;

export const MICROSOFT_PREVIEW_FLOW = [
  { label: "Entra app + redirect URI", done: true },
  { label: "Staff SSO with work account", done: true },
  { label: "Graph sync: mail + calendar", done: true },
  { label: "Send mail via Graph", done: false, note: "Roadmap" },
] as const;

export const DATA_PREVIEW_FLOW = [
  { label: "CSV member import with duplicate review", done: true },
  { label: "Roster feeds events, email, reports", done: true },
  { label: "ADMIN-gated CSV export", done: true },
  { label: "Scheduled backup scripts for IT", done: true },
] as const;

export const DATA_TRANSFER_HIGHLIGHTS = [
  { id: "import", label: "Roster import", value: "CSV", meta: "Review before apply", productId: "members" as const },
  { id: "export", label: "Board export", value: "CSV", meta: "Same numbers staff see", productId: "insights" as const },
  { id: "dnn", label: "Website publish", value: "HTML", meta: "Paste into EasyDNN", productId: "events" as const },
  { id: "tenant", label: "Data isolation", value: "1:1", meta: "Org per association", productId: "work" as const },
];
