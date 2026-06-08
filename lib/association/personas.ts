/**
 * Enterprise AMS user personas — drive dashboards and default department views.
 */

import type { AssociationDepartmentId } from "@/lib/association/departments";

export type UserPersona = {
  id: string;
  label: string;
  primaryDepartments: AssociationDepartmentId[];
  defaultLanding: string;
  keyCapabilities: string[];
};

export const USER_PERSONAS: UserPersona[] = [
  {
    id: "ceo_executive",
    label: "CEO / Executive",
    primaryDepartments: ["executive_office", "strategic_analytics"],
    defaultLanding: "insights",
    keyCapabilities: ["analytics:read", "member:read"],
  },
  {
    id: "government_affairs",
    label: "Government Affairs",
    primaryDepartments: ["advocacy", "policy"],
    defaultLanding: "advocacy",
    keyCapabilities: [
      "advocacy:read",
      "advocacy:write",
      "member:read",
      "Launch take-action campaigns → Engage audience",
      "Track hospital responses on advocacy dashboard",
      "Public take-action link per campaign",
    ],
  },
  {
    id: "policy_analyst",
    label: "Policy Analyst",
    primaryDepartments: ["policy", "advocacy"],
    defaultLanding: "advocacy",
    keyCapabilities: ["advocacy:read", "advocacy:write"],
  },
  {
    id: "workforce_leader",
    label: "HR / Workforce Leader",
    primaryDepartments: ["workforce_clinical", "human_resources", "education"],
    defaultLanding: "learn",
    keyCapabilities: ["education:read", "member:read"],
  },
  {
    id: "emergency_preparedness",
    label: "Emergency Preparedness",
    primaryDepartments: ["emergency_management"],
    defaultLanding: "emergency",
    keyCapabilities: ["emergency:read", "emergency:write", "engage:read"],
  },
  {
    id: "finance",
    label: "Finance Team",
    primaryDepartments: ["finance_legal", "accounting"],
    defaultLanding: "commerce",
    keyCapabilities: ["finance:read", "member:read"],
  },
  {
    id: "communications",
    label: "Communications Staff",
    primaryDepartments: ["communications"],
    defaultLanding: "engage",
    keyCapabilities: ["communications:read", "communications:write", "member:read"],
  },
  {
    id: "education_coordinator",
    label: "Education Coordinator",
    primaryDepartments: ["education"],
    defaultLanding: "learn",
    keyCapabilities: ["education:read", "education:write", "event:read"],
  },
  {
    id: "data_analyst",
    label: "Data Analyst",
    primaryDepartments: ["strategic_analytics"],
    defaultLanding: "insights",
    keyCapabilities: ["analytics:read", "member:export"],
  },
  {
    id: "association_admin",
    label: "Association Administrator",
    primaryDepartments: ["member_services"],
    defaultLanding: "members",
    keyCapabilities: ["member:read", "member:write", "member:import"],
  },
  {
    id: "sponsor_partner",
    label: "Sponsor / Business Partner",
    primaryDepartments: ["business_development", "hapevolve"],
    defaultLanding: "deals",
    keyCapabilities: ["member:read", "deals:read"],
  },
  {
    id: "hospital_contact",
    label: "Hospital Member Contact",
    primaryDepartments: ["member_services"],
    defaultLanding: "portal",
    keyCapabilities: [],
  },
];
