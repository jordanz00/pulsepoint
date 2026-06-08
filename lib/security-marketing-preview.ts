/**
 * Trust & security marketing preview — illustrative safeguards (not live metrics).
 */

import type { ProductId } from "@/lib/products";

export type SecuritySafeguard = {
  id: string;
  chip: string;
  title: string;
  summary: string;
  checklist: readonly string[];
  productId: ProductId;
  signal: { value: string; label: string };
};

export const SECURITY_SAFEGUARDS: SecuritySafeguard[] = [
  {
    id: "isolation",
    chip: "Isolation",
    title: "Private data per association",
    summary: "Each organization gets its own space—rosters and payments never mix between tenants.",
    checklist: [
      "Dedicated data space per association",
      "Cross-org exposure checks in CI",
      "No shared member or payment tables",
    ],
    productId: "crm",
    signal: { value: "1", label: "space per org" },
  },
  {
    id: "access",
    chip: "Access",
    title: "Role-based permissions",
    summary: "Staff only open screens and exports their role allows—no blanket admin by default.",
    checklist: [
      "Role-gated admin screens",
      "Export permissions by role",
      "Audit log on sensitive actions",
    ],
    productId: "members",
    signal: { value: "100%", label: "role-gated" },
  },
  {
    id: "imports",
    chip: "Imports",
    title: "Reviewed before live",
    summary: "Spreadsheet uploads land in staging—staff resolve duplicates before production changes.",
    checklist: [
      "CSV upload with duplicate review",
      "Staged apply—not silent overwrite",
      "Exceptions queue for sync issues",
    ],
    productId: "events",
    signal: { value: "Staged", label: "before apply" },
  },
  {
    id: "integrity",
    chip: "Payments",
    title: "Charged once, logged always",
    summary: "Registrations and dues process once with clear receipts—failed charges surface in Exceptions.",
    checklist: [
      "Idempotent Stripe webhooks",
      "No silent double charges",
      "Scheduled backups + audit trail",
    ],
    productId: "insights",
    signal: { value: "Auto", label: "audit + backup" },
  },
] as const;

export const SECURITY_VAULT_ORGS = [
  { id: "a", label: "Association A", productId: "members" as const },
  { id: "b", label: "Association B", productId: "events" as const },
  { id: "c", label: "Association C", productId: "advocacy" as const },
] as const;

export const SECURITY_ACCESS_ROLES = [
  { role: "Admin", scope: "Workspace + exports", level: "full" as const },
  { role: "Programs", scope: "Events + roster", level: "standard" as const },
  { role: "Read-only", scope: "Dashboards", level: "view" as const },
] as const;

export const SECURITY_IMPORT_FLOW = [
  { step: "Upload", detail: "CSV lands in staging" },
  { step: "Review", detail: "Staff check duplicates" },
  { step: "Apply", detail: "Production when ready" },
] as const;
