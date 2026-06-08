/**
 * HAP-style association departments — org structure for RBAC, nav, and workflows.
 *
 * WHO: Enterprise AMS module routing, staff grants, workflow templates
 * HOW IT CONNECTS: lib/association/modules.ts, lib/association/rbac-matrix.ts
 */

export const ASSOCIATION_DEPARTMENT_IDS = [
  "executive_office",
  "accounting",
  "advocacy",
  "business_development",
  "communications",
  "education",
  "emergency_management",
  "finance_legal",
  "human_resources",
  "information_technology",
  "member_services",
  "policy",
  "quality_initiatives",
  "strategic_analytics",
  "workforce_clinical",
  "hapevolve",
] as const;

export type AssociationDepartmentId = (typeof ASSOCIATION_DEPARTMENT_IDS)[number];

export type AssociationDepartment = {
  id: AssociationDepartmentId;
  name: string;
  shortName: string;
  description: string;
  /** Primary PulsePoint product modules */
  productModules: string[];
};

export const ASSOCIATION_DEPARTMENTS: Record<AssociationDepartmentId, AssociationDepartment> = {
  executive_office: {
    id: "executive_office",
    name: "Executive Office",
    shortName: "Executive",
    description: "CEO office, board relations, strategic priorities, executive dashboards.",
    productModules: ["work", "insights", "members"],
  },
  accounting: {
    id: "accounting",
    name: "Accounting",
    shortName: "Accounting",
    description: "AP workflows, dues reconciliation, GL integration touchpoints.",
    productModules: ["commerce", "insights"],
  },
  advocacy: {
    id: "advocacy",
    name: "Advocacy",
    shortName: "Advocacy",
    description: "Legislative tracking, grassroots, PAC, legislator relationships, action alerts.",
    productModules: ["crm", "engage", "deals"],
  },
  business_development: {
    id: "business_development",
    name: "Business Development & Operations",
    shortName: "Biz Dev",
    description: "Sponsors, vendors, partnerships, operational programs.",
    productModules: ["deals", "events", "crm"],
  },
  communications: {
    id: "communications",
    name: "Communications and Public Affairs",
    shortName: "Comms",
    description: "Email campaigns, media database, press workflows, member segmentation.",
    productModules: ["engage", "members"],
  },
  education: {
    id: "education",
    name: "Education",
    shortName: "Education",
    description: "CE/CME, webinars, learning paths, transcripts, faculty.",
    productModules: ["learn", "events"],
  },
  emergency_management: {
    id: "emergency_management",
    name: "Emergency Management",
    shortName: "Emergency",
    description: "Hospital readiness, alerting, regional coordination, cyber resilience.",
    productModules: ["members", "engage"],
  },
  finance_legal: {
    id: "finance_legal",
    name: "Finance & Legal Affairs",
    shortName: "Finance/Legal",
    description: "Budgets, contracts, grants, audit, compliance reporting.",
    productModules: ["commerce", "insights"],
  },
  human_resources: {
    id: "human_resources",
    name: "Human Resource Services",
    shortName: "HR",
    description: "Association HR operations; member workforce programs cross-link.",
    productModules: ["members", "learn"],
  },
  information_technology: {
    id: "information_technology",
    name: "Information & Technology Services",
    shortName: "IT",
    description: "SSO, integrations, security, data warehouse, platform admin.",
    productModules: ["work"],
  },
  member_services: {
    id: "member_services",
    name: "Member Services & Strategic Initiatives",
    shortName: "Member Services",
    description: "Directory, renewals, MemberPulse, committees, organizational accounts.",
    productModules: ["members", "crm"],
  },
  policy: {
    id: "policy",
    name: "Policy",
    shortName: "Policy",
    description: "Issue briefs, regulatory comments, federal/state policy tracking.",
    productModules: ["crm", "advocacy_issues"],
  },
  quality_initiatives: {
    id: "quality_initiatives",
    name: "Quality Initiatives",
    shortName: "Quality",
    description: "Clinical quality programs, benchmarking participation.",
    productModules: ["learn", "insights"],
  },
  strategic_analytics: {
    id: "strategic_analytics",
    name: "Strategic Analytics",
    shortName: "Analytics",
    description: "Executive dashboards, warehouse exports, workforce and engagement BI.",
    productModules: ["insights"],
  },
  workforce_clinical: {
    id: "workforce_clinical",
    name: "Workforce & Clinical Affairs",
    shortName: "Workforce",
    description: "Pipeline programs, scholarships, clinical leadership initiatives.",
    productModules: ["learn", "members"],
  },
  hapevolve: {
    id: "hapevolve",
    name: "HAPevolve",
    shortName: "HAPevolve",
    description: "Consulting and business development arm — partner engagements.",
    productModules: ["deals", "crm"],
  },
};

export function getDepartment(id: AssociationDepartmentId): AssociationDepartment {
  return ASSOCIATION_DEPARTMENTS[id];
}
