/**
 * PulsePoint What's New — mapped from Nimble CRM updates (no AI features).
 * @see https://www.nimble.com/whats-new/
 */

export type WhatsNewFeature = {
  id: string;
  title: string;
  summary: string;
  badge?: "new" | "updated";
  pulsePath?: string;
  implemented: boolean;
};

export const PULSEPOINT_WHATS_NEW: WhatsNewFeature[] = [
  {
    id: "email-sequences",
    title: "Email sequences",
    summary: "Time-based multi-step outreach with pre-built association templates.",
    badge: "new",
    pulsePath: "/demo-healthcare/engage/sequences",
    implemented: true,
  },
  {
    id: "web-forms",
    title: "Web forms + post-submission email",
    summary: "Hosted lead capture, automatic thank-you email, and workflow enrollment.",
    badge: "new",
    pulsePath: "/demo-healthcare/crm/forms",
    implemented: true,
  },
  {
    id: "workflow-automation",
    title: "Workflow stage automation",
    summary: "Triggers email, notes, or sequence enrollment when cards move stages.",
    badge: "new",
    pulsePath: "/demo-healthcare/crm/workflows",
    implemented: true,
  },
  {
    id: "deal-pipelines",
    title: "Partnership pipelines (drag & move)",
    summary: "Multiple pipelines and interactive kanban for sponsorship and partnership opportunities.",
    badge: "updated",
    pulsePath: "/demo-healthcare/deals/pipeline",
    implemented: true,
  },
  {
    id: "lead-qualification",
    title: "Lead qualification board",
    summary: "Qualify inbound leads and convert to partnership opportunities in one click.",
    badge: "new",
    pulsePath: "/demo-healthcare/crm/workflows",
    implemented: true,
  },
  {
    id: "bulk-edit",
    title: "Bulk contact editing",
    summary: "Update many member records from the directory in a few clicks.",
    badge: "updated",
    pulsePath: "/demo-healthcare/members",
    implemented: true,
  },
];
