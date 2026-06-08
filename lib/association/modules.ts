/**
 * Enterprise AMS requirement modules (1–14) mapped to PulsePoint implementation status.
 */

import type { AssociationDepartmentId } from "@/lib/association/departments";

export type ModulePhase = "live" | "alpha" | "foundation" | "roadmap";

export type EnterpriseModule = {
  id: string;
  title: string;
  requirementArea: number;
  phase: ModulePhase;
  departments: AssociationDepartmentId[];
  pulseProducts: string[];
  schemaModels: string[];
  summary: string;
};

export const ENTERPRISE_MODULES: EnterpriseModule[] = [
  {
    id: "membership_crm",
    title: "Membership & CRM",
    requirementArea: 1,
    phase: "live",
    departments: ["member_services", "executive_office", "business_development"],
    pulseProducts: ["members", "crm", "deals"],
    schemaModels: ["Member", "MemberOrganization", "MemberRole", "MemberRelationship", "MemberPulse"],
    summary:
      "Directory, org accounts, parent-child hospitals, segmentation, renewals, MemberPulse, committees, sponsors.",
  },
  {
    id: "advocacy_ga",
    title: "Advocacy & Government Affairs",
    requirementArea: 2,
    phase: "alpha",
    departments: ["advocacy", "policy"],
    pulseProducts: ["advocacy", "crm", "engage"],
    schemaModels: ["AdvocacyIssue", "AdvocacyCampaign"],
    summary: "Issue tracking, take-action campaigns, internal PAC fundraising via Giving; legislator CRM.",
  },
  {
    id: "education_workforce",
    title: "Education & Workforce Development",
    requirementArea: 3,
    phase: "alpha",
    departments: ["education", "workforce_clinical"],
    pulseProducts: ["learn", "events"],
    schemaModels: ["Course", "CECreditAward", "CourseEnrollment"],
    summary: "CE credits, courses, events; LMS integration roadmap.",
  },
  {
    id: "emergency_management",
    title: "Emergency Management",
    requirementArea: 4,
    phase: "foundation",
    departments: ["emergency_management"],
    pulseProducts: ["members", "engage"],
    schemaModels: ["EmergencyContact", "EmergencyReadinessReport"],
    summary: "Emergency rosters, readiness reports, alerting via Engage sequences.",
  },
  {
    id: "communications",
    title: "Communications & Public Affairs",
    requirementArea: 5,
    phase: "alpha",
    departments: ["communications"],
    pulseProducts: ["engage", "members"],
    schemaModels: ["EmailCampaign", "EmailAudience", "EmailTemplate"],
    summary: "Campaigns, segmentation, send logs; CMS integration roadmap.",
  },
  {
    id: "strategic_analytics",
    title: "Strategic Analytics & Reporting",
    requirementArea: 6,
    phase: "alpha",
    departments: ["strategic_analytics", "executive_office"],
    pulseProducts: ["insights"],
    schemaModels: ["InsightsSnapshot", "DashboardLayout"],
    summary: "KPI dashboards, MemberPulse org summary, warehouse CSV export.",
  },
  {
    id: "finance_accounting",
    title: "Finance & Accounting",
    requirementArea: 7,
    phase: "roadmap",
    departments: ["finance_legal", "accounting"],
    pulseProducts: ["commerce"],
    schemaModels: ["CommerceOrder", "Donation"],
    summary: "Dues/checkout today; GL/NetSuite/QuickBooks via integration registry.",
  },
  {
    id: "events_conferences",
    title: "Events & Conferences",
    requirementArea: 8,
    phase: "live",
    departments: ["education", "business_development"],
    pulseProducts: ["events"],
    schemaModels: ["Event", "EventSession", "EventSpeaker", "EventSponsor"],
    summary: "Registration, check-in, speakers, sponsors; multi-track alpha.",
  },
  {
    id: "workforce_clinical",
    title: "Workforce & Clinical Affairs",
    requirementArea: 9,
    phase: "foundation",
    departments: ["workforce_clinical", "quality_initiatives"],
    pulseProducts: ["learn", "members"],
    schemaModels: ["MemberRole", "Course"],
    summary: "Program tracking via roles + Learn; shortage analytics roadmap.",
  },
  {
    id: "security_governance",
    title: "Security, Compliance & Governance",
    requirementArea: 10,
    phase: "foundation",
    departments: ["information_technology", "finance_legal"],
    pulseProducts: ["work"],
    schemaModels: ["AuditLog", "OrgMembership", "IntegrationConnection"],
    summary: "RBAC, audit trail, backup requirements, enterprise SSO roadmap, HIPAA-aware design.",
  },
  {
    id: "integrations",
    title: "Integrations",
    requirementArea: 11,
    phase: "foundation",
    departments: ["information_technology"],
    pulseProducts: ["work"],
    schemaModels: ["IntegrationConnection"],
    summary: "Vendor registry with adapter pattern; Stripe/Clerk live; workspace SSO and BI planned.",
  },
  {
    id: "automation_ai",
    title: "Automation & AI",
    requirementArea: 12,
    phase: "foundation",
    departments: ["strategic_analytics", "member_services"],
    pulseProducts: ["crm", "members"],
    schemaModels: ["CrmWorkflow", "AutomationException"],
    summary: "Workflow automation live; MemberPulse predictive renewal; AI insights roadmap.",
  },
  {
    id: "technical_architecture",
    title: "Technical Architecture",
    requirementArea: 13,
    phase: "live",
    departments: ["information_technology"],
    pulseProducts: ["work"],
    schemaModels: ["Organization"],
    summary: "Multi-tenant Next.js, Prisma, API-first actions, Postgres target, WCAG bar in UI-QUALITY-BAR.",
  },
  {
    id: "personas",
    title: "User Personas & Journeys",
    requirementArea: 14,
    phase: "foundation",
    departments: ["member_services"],
    pulseProducts: ["members", "work"],
    schemaModels: [],
    summary: "Persona definitions drive department dashboards and capability grants.",
  },
];

export function modulesByPhase(phase: ModulePhase): EnterpriseModule[] {
  return ENTERPRISE_MODULES.filter((m) => m.phase === phase);
}
