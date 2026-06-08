/** Labels for Nimble-inspired PulsePoint CRM */

export const RELATIONSHIP_HEALTH_LABEL: Record<string, string> = {
  STRONG: "Strong",
  STEADY: "Steady",
  COOLING: "Cooling",
  AT_RISK: "At risk",
};

export const MEMBER_RELATION_LABEL: Record<string, string> = {
  COLLEAGUE: "Colleague",
  REFERRAL: "Referral",
  MENTOR: "Mentor",
  MENTEE: "Mentee",
  BOARD_PEER: "Board peer",
  SPOUSE: "Spouse",
  OTHER: "Other",
};

export const CONTACT_SOURCE_LABEL: Record<string, string> = {
  MANUAL: "Manual entry",
  CSV_IMPORT: "CSV import",
  EMAIL_CAPTURE: "Inbox capture",
  WEB_CAPTURE: "Web capture",
  LINKEDIN: "LinkedIn",
  DIRECTORY: "Public directory",
};

export const NOTE_CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "in_person", label: "In person" },
  { value: "other", label: "Other" },
] as const;

export const WORKFLOW_DEPARTMENT_LABEL: Record<string, string> = {
  Membership: "Membership",
  Leadership: "Leadership",
  HR: "HR",
  Marketing: "Marketing",
  Development: "Development",
  Executive: "Executive",
  Finance: "Finance",
};

export {
  DEFAULT_CRM_WORKFLOWS,
  WORKFLOW_TEMPLATES,
  type WorkflowTemplateDef,
} from "@/lib/crm/workflow-templates";
