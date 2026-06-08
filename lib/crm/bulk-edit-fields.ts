/**
 * Bulk-editable member fields — Nimble-style find & replace on the directory.
 */

export type BulkFieldType = "text" | "enum" | "tags" | "datetime" | "custom";

export type BulkEditableField = {
  id: string;
  label: string;
  type: BulkFieldType;
  /** Prisma Member column or `customFields.{key}` */
  path: string;
  options?: Array<{ value: string; label: string }>;
  supportsRegex?: boolean;
};

export const MEMBER_BULK_EDIT_FIELDS: BulkEditableField[] = [
  {
    id: "status",
    label: "Status",
    type: "enum",
    path: "status",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "INACTIVE", label: "Inactive" },
      { value: "LAPSED", label: "Lapsed" },
    ],
  },
  {
    id: "relationshipHealth",
    label: "Relationship health",
    type: "enum",
    path: "relationshipHealth",
    options: [
      { value: "STRONG", label: "Strong" },
      { value: "STEADY", label: "Steady" },
      { value: "COOLING", label: "Cooling" },
      { value: "AT_RISK", label: "At risk" },
    ],
  },
  {
    id: "company",
    label: "Company",
    type: "text",
    path: "company",
    supportsRegex: true,
  },
  {
    id: "jobTitle",
    label: "Job title",
    type: "text",
    path: "jobTitle",
    supportsRegex: true,
  },
  {
    id: "phone",
    label: "Phone",
    type: "text",
    path: "phone",
    supportsRegex: true,
  },
  {
    id: "email",
    label: "Email",
    type: "text",
    path: "email",
    supportsRegex: true,
  },
  {
    id: "linkedInUrl",
    label: "LinkedIn URL",
    type: "text",
    path: "linkedInUrl",
    supportsRegex: true,
  },
  {
    id: "websiteUrl",
    label: "Website",
    type: "text",
    path: "websiteUrl",
    supportsRegex: true,
  },
  {
    id: "tags",
    label: "Tags",
    type: "tags",
    path: "tags",
    supportsRegex: true,
  },
  {
    id: "nextFollowUpAt",
    label: "Next follow-up",
    type: "datetime",
    path: "nextFollowUpAt",
  },
  {
    id: "customFields.credentials",
    label: "Credentials (custom field)",
    type: "custom",
    path: "customFields.credentials",
    supportsRegex: true,
  },
  {
    id: "customFields.state",
    label: "State (custom field)",
    type: "custom",
    path: "customFields.state",
    supportsRegex: true,
  },
];

export function getBulkField(id: string): BulkEditableField | undefined {
  return MEMBER_BULK_EDIT_FIELDS.find((f) => f.id === id);
}
