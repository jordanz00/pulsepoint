/**
 * Pre-built workflow templates — Nimble-inspired, association-adapted.
 */

import type { WorkflowField, WorkflowStage } from "@/lib/crm/workflow-types";

export type WorkflowTemplateDef = {
  templateKey: string;
  kind:
    | "ONBOARD_MEMBER"
    | "RE_ENGAGE"
    | "BOARD_OUTREACH"
    | "HIRING"
    | "INFLUENCER_PR"
    | "FUNDRAISING"
    | "NETWORKING"
    | "ACCOUNTS_RECEIVABLE"
    | "CUSTOM";
  name: string;
  description: string;
  department: string;
  stages: WorkflowStage[];
  fields: WorkflowField[];
};

const stdFields = {
  owner: { id: "owner", label: "Owner", type: "text" as const },
  priority: {
    id: "priority",
    label: "Priority",
    type: "select" as const,
    options: ["Low", "Medium", "High"],
  },
  nextAction: { id: "next_action", label: "Next action", type: "text" as const },
  dueNote: { id: "due_note", label: "Due note", type: "date" as const },
};

export const WORKFLOW_TEMPLATES: WorkflowTemplateDef[] = [
  {
    templateKey: "onboard_member",
    kind: "ONBOARD_MEMBER",
    name: "Welcome new member",
    description: "Relationship-first onboarding from first touch to first event.",
    department: "Membership",
    stages: [
      { id: "new", order: 0, label: "New", instructions: "Confirm record and assign owner." },
      { id: "welcome", order: 1, label: "Welcome sent", instructions: "Personal welcome email delivered." },
      { id: "profile", order: 2, label: "Profile complete", instructions: "Member updated directory profile." },
      { id: "engaged", order: 3, label: "First engagement", instructions: "Registered for event or community." },
      { id: "done", order: 4, label: "Onboarded", instructions: "Mark complete when cadence is set." },
    ],
    fields: [stdFields.owner, stdFields.priority, stdFields.nextAction],
  },
  {
    templateKey: "re_engage",
    kind: "RE_ENGAGE",
    name: "Re-engage lapsed contact",
    description: "Warm outreach when engagement drops or membership lapses.",
    department: "Membership",
    stages: [
      { id: "identify", order: 0, label: "Identified", instructions: "Review 360° activity and notes." },
      { id: "outreach", order: 1, label: "Outreach started", instructions: "Personal check-in sent." },
      { id: "conversation", order: 2, label: "In conversation", instructions: "Active dialogue — log outcomes." },
      { id: "won_back", order: 3, label: "Re-engaged", instructions: "Renewed, registered, or committed." },
    ],
    fields: [stdFields.owner, stdFields.nextAction, stdFields.dueNote],
  },
  {
    templateKey: "board_outreach",
    kind: "BOARD_OUTREACH",
    name: "Board relationship touch",
    description: "Executive cadence for board and C-suite relationships.",
    department: "Leadership",
    stages: [
      { id: "prep", order: 0, label: "Prep", instructions: "Review roles, gifts, and last notes." },
      { id: "scheduled", order: 1, label: "Touch scheduled", instructions: "Meeting or call on calendar." },
      { id: "completed", order: 2, label: "Touch completed", instructions: "Log outcome and next follow-up." },
    ],
    fields: [stdFields.owner, stdFields.priority, stdFields.nextAction],
  },
  {
    templateKey: "hiring",
    kind: "HIRING",
    name: "Staff hiring pipeline",
    description: "Track candidates and hiring managers through offer.",
    department: "HR",
    stages: [
      { id: "applicant", order: 0, label: "Applicant", instructions: "New candidate in pool." },
      { id: "screen", order: 1, label: "Phone screen", instructions: "Initial screen complete." },
      { id: "interview", order: 2, label: "Interview", instructions: "Panel or leadership interview." },
      { id: "offer", order: 3, label: "Offer", instructions: "Offer extended or negotiating." },
      { id: "hired", order: 4, label: "Hired", instructions: "Accepted — close card." },
    ],
    fields: [
      { id: "role", label: "Role", type: "text" },
      stdFields.owner,
      { id: "source", label: "Source", type: "select", options: ["Referral", "LinkedIn", "Job board", "Other"] },
    ],
  },
  {
    templateKey: "influencer_pr",
    kind: "INFLUENCER_PR",
    name: "Influencer & media outreach",
    description: "PR and influencer relationship tracking.",
    department: "Marketing",
    stages: [
      { id: "prospect", order: 0, label: "Prospect", instructions: "Identify fit and audience." },
      { id: "pitched", order: 1, label: "Pitched", instructions: "Initial pitch sent." },
      { id: "negotiating", order: 2, label: "Negotiating", instructions: "Terms or content discussion." },
      { id: "active", order: 3, label: "Active partner", instructions: "Campaign or coverage live." },
    ],
    fields: [
      { id: "channel", label: "Channel", type: "select", options: ["LinkedIn", "Podcast", "Press", "Newsletter"] },
      stdFields.owner,
      stdFields.nextAction,
    ],
  },
  {
    templateKey: "fundraising",
    kind: "FUNDRAISING",
    name: "Fundraising cultivation",
    description: "Major gift and sponsor cultivation workflow.",
    department: "Development",
    stages: [
      { id: "prospect", order: 0, label: "Prospect", instructions: "Research capacity and linkage." },
      { id: "cultivate", order: 1, label: "Cultivation", instructions: "Meetings and stewardship touches." },
      { id: "ask", order: 2, label: "Ask", instructions: "Proposal or pledge conversation." },
      { id: "closed", order: 3, label: "Closed won", instructions: "Gift or sponsorship secured." },
    ],
    fields: [
      { id: "ask_amount", label: "Ask amount", type: "text" },
      stdFields.owner,
      stdFields.priority,
    ],
  },
  {
    templateKey: "networking",
    kind: "NETWORKING",
    name: "Professional network building",
    description: "Expand strategic relationships beyond members.",
    department: "Executive",
    stages: [
      { id: "target", order: 0, label: "Target", instructions: "Identify strategic contact." },
      { id: "intro", order: 1, label: "Introduction", instructions: "Warm intro or first meeting." },
      { id: "nurture", order: 2, label: "Nurturing", instructions: "Ongoing value exchanges." },
      { id: "ally", order: 3, label: "Active ally", instructions: "Recurring collaborator." },
    ],
    fields: [stdFields.owner, stdFields.nextAction],
  },
  {
    templateKey: "lead_qualification",
    kind: "CUSTOM",
    name: "Lead qualification",
    description:
      "Visually qualify inbound leads — convert qualified contacts to partnership opportunities with one click (Nimble lead board).",
    department: "Sales",
    stages: [
      { id: "new", order: 0, label: "New lead", instructions: "Captured from web form or prospector." },
      { id: "contacted", order: 1, label: "Contacted", instructions: "Initial outreach logged." },
      { id: "qualified", order: 2, label: "Qualified", instructions: "Fit confirmed — convert to partnership when ready." },
      { id: "nurture", order: 3, label: "Nurture", instructions: "Long-cycle — stay in sequence or workflow." },
    ],
    fields: [
      stdFields.owner,
      stdFields.priority,
      { id: "lead_source", label: "Lead source", type: "select", options: ["Web form", "Event", "Referral", "Prospector", "Other"] },
      { id: "estimated_value", label: "Est. value", type: "text" },
    ],
  },
  {
    templateKey: "accounts_receivable",
    kind: "ACCOUNTS_RECEIVABLE",
    name: "Accounts receivable follow-up",
    description: "Invoice and dues collection outreach.",
    department: "Finance",
    stages: [
      { id: "due", order: 0, label: "Invoice due", instructions: "Payment within terms." },
      { id: "reminder", order: 1, label: "Reminder sent", instructions: "First reminder email." },
      { id: "call", order: 2, label: "Phone follow-up", instructions: "Staff call logged." },
      { id: "resolved", order: 3, label: "Resolved", instructions: "Paid or payment plan." },
    ],
    fields: [
      { id: "invoice_ref", label: "Invoice #", type: "text" },
      stdFields.owner,
      stdFields.dueNote,
    ],
  },
];

/** Legacy export — maps to template steps for backward compat */
export const DEFAULT_CRM_WORKFLOWS = WORKFLOW_TEMPLATES.filter((t) =>
  ["onboard_member", "re_engage", "board_outreach"].includes(t.templateKey),
).map((t) => ({
  kind: t.kind,
  name: t.name,
  description: t.description,
  steps: t.stages.map((s) => ({
    id: s.id,
    order: s.order,
    type: "task",
    label: s.label,
  })),
}));
