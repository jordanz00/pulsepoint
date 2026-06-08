/**
 * Quake OS AMS Core — module registry service.
 * Bridges PulsePoint ENTERPRISE_MODULES to Quake OS planning.
 */
import { ENTERPRISE_MODULES, type EnterpriseModule, type ModulePhase } from "@/lib/association/modules";

export type AmsModuleStatus = {
  id: string;
  title: string;
  phase: ModulePhase;
  products: string[];
  schemaModels: string[];
  summary: string;
  requirementArea: number;
};

export function listAmsModules(): AmsModuleStatus[] {
  return ENTERPRISE_MODULES.map((m: EnterpriseModule) => ({
    id: m.id,
    title: m.title,
    phase: m.phase,
    products: m.pulseProducts,
    schemaModels: m.schemaModels,
    summary: m.summary,
    requirementArea: m.requirementArea,
  }));
}

export function getAmsModule(id: string): AmsModuleStatus | undefined {
  return listAmsModules().find((m) => m.id === id);
}

export function modulesByPhase(phase: ModulePhase): AmsModuleStatus[] {
  return listAmsModules().filter((m) => m.phase === phase);
}

export const AMS_CORE_DOMAINS = [
  "membership",
  "events",
  "committees",
  "boards",
  "advocacy",
  "fundraising",
  "crm",
  "education",
  "reporting",
  "communities",
] as const;

export type AmsCoreDomain = (typeof AMS_CORE_DOMAINS)[number];

export const DOMAIN_MODULE_MAP: Record<AmsCoreDomain, string[]> = {
  membership: ["membership_crm"],
  events: ["education_workforce", "membership_crm"],
  committees: ["membership_crm"],
  boards: ["membership_crm", "strategic_analytics"],
  advocacy: ["advocacy_ga"],
  fundraising: ["advocacy_ga"],
  crm: ["membership_crm"],
  education: ["education_workforce"],
  reporting: ["strategic_analytics"],
  communities: ["communications"],
};

export function getDomainCoverage(): Array<{ domain: AmsCoreDomain; modules: AmsModuleStatus[] }> {
  return AMS_CORE_DOMAINS.map((domain) => ({
    domain,
    modules: DOMAIN_MODULE_MAP[domain]
      .map((id) => getAmsModule(id))
      .filter((m): m is AmsModuleStatus => Boolean(m)),
  }));
}
