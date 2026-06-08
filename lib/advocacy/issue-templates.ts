/**
 * Healthcare advocacy issue templates — seed copy for issue hub (alpha).
 *
 * validationStatus: illustrative_only until association SME reviews policy language.
 */

export type AdvocacyIssueAreaId =
  | "ACCESS_TO_CARE"
  | "MATERNAL_HEALTH"
  | "WORKPLACE_VIOLENCE"
  | "BEHAVIORAL_HEALTH"
  | "SUBSTANCE_USE"
  | "SDOH_FOOD_ACCESS"
  | "PHYSICIAN_ACCESS"
  | "NURSING_WORKFORCE";

export type AdvocacyIssueTemplate = {
  area: AdvocacyIssueAreaId;
  slug: string;
  title: string;
  summary: string;
  jurisdiction: "STATE" | "FEDERAL" | "BOTH";
  memberNeed: string;
  staffWorkflow: string;
  pulseModules: string[];
  ceOpportunity: string;
  suggestedKpis: Array<{ label: string; validationStatus: "pending_sme" }>;
  /** Portfolio showcase — multi-paragraph story (illustrative) */
  storyParagraphs?: string[];
  impactBullets?: string[];
  /** YouTube/Vimeo URL — parsed via lib/learn/video-embed.ts */
  heroVideoUrl?: string;
  /** Local hero still — path under /advocacy-toolkits/ */
  heroImageUrl?: string;
  /** Printable toolkit page under /advocacy-toolkits/ */
  toolkitPath?: string;
  toolkitLabel?: string;
  contentMeta: { validationStatus: "illustrative_only"; source: "quake-os-healthcare-sme" };
};

export const ADVOCACY_ISSUE_TEMPLATES: AdvocacyIssueTemplate[] = [
  {
    area: "ACCESS_TO_CARE",
    slug: "access-to-care",
    title: "Access to care — coverage and wait times",
    summary:
      "Illustrative: Support policies that reduce appointment delays, close coverage gaps, and expand rural and telehealth access for member hospitals.",
    jurisdiction: "BOTH",
    memberNeed: "Clear alerts when access barriers affect patient volumes and community trust.",
    staffWorkflow: "Issue brief → hospital sign-on → legislator outreach via Engage.",
    pulseModules: ["Advocacy", "Engage", "Insights"],
    ceOpportunity: "Optional briefing module on access policy basics for board members.",
    suggestedKpis: [
      { label: "Hospitals signed on", validationStatus: "pending_sme" },
      { label: "Legislator meetings scheduled", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "MATERNAL_HEALTH",
    slug: "maternal-health",
    title: "Maternal health — education and workforce",
    summary:
      "Illustrative: Coalition campaigns on mortality prevention, provider workforce, and perinatal education for member facilities.",
    jurisdiction: "STATE",
    memberNeed: "Shareable resources and coalition sign-on for maternal health initiatives.",
    staffWorkflow: "Template issue → CE-linked Learn playlist → campaign launch.",
    pulseModules: ["Advocacy", "Learn", "Events"],
    ceOpportunity: "CNE-eligible maternal safety briefings (alpha catalog).",
    suggestedKpis: [
      { label: "Coalition hospitals enrolled", validationStatus: "pending_sme" },
      { label: "Education completions", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "WORKPLACE_VIOLENCE",
    slug: "workplace-violence",
    title: "Workplace violence — hospital staff safety",
    summary:
      "Illustrative: Legislative toolkits, reporting workflows, and training requirements aligned with hospital security programs.",
    jurisdiction: "BOTH",
    memberNeed: "Unified take-action when safety bills move; training completion tracking.",
    staffWorkflow: "Issue hub → mandatory training tie-in via Learn → legislator alerts.",
    pulseModules: ["Advocacy", "Learn", "MemberCore"],
    ceOpportunity: "Workplace violence prevention modules for clinical staff.",
    suggestedKpis: [
      { label: "Hospitals reporting incidents policy adoption", validationStatus: "pending_sme" },
      { label: "Training enrollments", validationStatus: "pending_sme" },
    ],
    storyParagraphs: [
      "Hospital staff face rising safety risks in emergency, behavioral health, and inpatient settings. Member associations need one place to share legislative toolkits, training requirements, and take-action alerts — without scattered email threads.",
      "PulsePoint connects issue pages, Learn training modules, and hospital sign-on campaigns so safety advocacy and workforce education stay on one workflow.",
    ],
    impactBullets: [
      "Executives receive Engage alerts when safety bills move.",
      "Clinical staff complete prevention modules tied to the issue.",
      "Policy staff track hospital participation from the advocacy hub.",
    ],
    heroImageUrl: "/advocacy-toolkits/workplace-violence-hero.svg",
    heroVideoUrl: "https://www.youtube.com/watch?v=I_kNf606tQA",
    toolkitPath: "/advocacy-toolkits/workplace-violence.html",
    toolkitLabel: "Workplace violence prevention toolkit (print to PDF)",
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "BEHAVIORAL_HEALTH",
    slug: "behavioral-health",
    title: "Behavioral health — integration and parity",
    summary:
      "Illustrative: Advocate for primary care integration, parity enforcement, crisis services, and behavioral workforce investments.",
    jurisdiction: "BOTH",
    memberNeed: "Issue updates when parity or crisis funding bills advance.",
    staffWorkflow: "Multi-issue dashboard → segmented Engage by facility type.",
    pulseModules: ["Advocacy", "Engage", "Insights"],
    ceOpportunity: "Behavioral health integration primers for hospital leaders.",
    suggestedKpis: [
      { label: "Member hospitals engaged on parity", validationStatus: "pending_sme" },
      { label: "Grassroots responses captured", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "SUBSTANCE_USE",
    slug: "substance-use",
    title: "Substance use disorder — prevention and treatment access",
    summary:
      "Illustrative: Prevention, treatment access, harm reduction, and provider education campaigns for adults and minors.",
    jurisdiction: "STATE",
    memberNeed: "Coordinated messaging without unverified legal claims in public copy.",
    staffWorkflow: "SME-reviewed templates → hospital toolkit downloads → campaign.",
    pulseModules: ["Advocacy", "Learn", "Engage"],
    ceOpportunity: "Provider education tracks on SUD screening and referral.",
    suggestedKpis: [
      { label: "Toolkit downloads", validationStatus: "pending_sme" },
      { label: "Hospital coalition participation", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "SDOH_FOOD_ACCESS",
    slug: "sdoh-food-access",
    title: "Food insecurity and SDOH screening",
    summary:
      "Illustrative: Connect community benefit, food access programs, and screening workflows with advocacy on SDOH policy.",
    jurisdiction: "STATE",
    memberNeed: "Show community impact stories tied to screening and referral programs.",
    staffWorkflow: "Issue brief + Learn content + optional Giving tie-in for food banks.",
    pulseModules: ["Advocacy", "Learn", "Giving"],
    ceOpportunity: "SDOH screening workflow education for care teams.",
    suggestedKpis: [
      { label: "Hospitals with SDOH programs linked", validationStatus: "pending_sme" },
      { label: "Screening workflow completions", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "PHYSICIAN_ACCESS",
    slug: "physician-access",
    title: "Physician access — scope and rural recruitment",
    summary:
      "Illustrative: Scope-of-practice, residency slots, and rural physician recruitment aligned with member workforce goals.",
    jurisdiction: "BOTH",
    memberNeed: "Track bills affecting physician supply and rural incentives.",
    staffWorkflow: "Issue templates → career fair tie-in for medical students.",
    pulseModules: ["Advocacy", "Learn", "Events"],
    ceOpportunity: "Medical student pathway content in virtual career fair.",
    suggestedKpis: [
      { label: "Residency expansion advocates", validationStatus: "pending_sme" },
      { label: "Career fair registrants", validationStatus: "pending_sme" },
    ],
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
  {
    area: "NURSING_WORKFORCE",
    slug: "nursing-workforce",
    title: "Nursing workforce — pipeline and retention",
    summary:
      "Illustrative: Pipeline programs, retention incentives, education support, and transition programs for new nurses.",
    jurisdiction: "BOTH",
    memberNeed: "Connect nursing students, employers, and incentive programs in one hub.",
    staffWorkflow: "Workforce program in Learn → virtual career fair event → advocacy sign-on.",
    pulseModules: ["Advocacy", "Learn", "Events", "MemberCore"],
    ceOpportunity: "Nursing CE playlists and mentorship program enrollment.",
    suggestedKpis: [
      { label: "Pipeline program enrollments", validationStatus: "pending_sme" },
      { label: "Employer booth registrations", validationStatus: "pending_sme" },
    ],
    storyParagraphs: [
      "Member hospitals face a widening gap between open nursing roles and students entering the pipeline. State associations are uniquely positioned to connect education, employers, and incentive programs in one member-facing hub.",
      "PulsePoint ties advocacy sign-on, Learn playlists, and virtual career fair events so workforce policy and practical pathways stay on one story — not scattered spreadsheets and email threads.",
    ],
    impactBullets: [
      "Students discover hospital careers through video and virtual fair booths.",
      "New grads enroll in transition programs tied to member employers.",
      "Advocacy staff launch legislator outreach when pipeline bills move.",
    ],
    heroImageUrl: "/advocacy-toolkits/nursing-workforce-hero.svg",
    heroVideoUrl: "https://www.youtube.com/watch?v=rQ8Q4-njXrE",
    toolkitPath: "/advocacy-toolkits/nursing-workforce.html",
    toolkitLabel: "Nursing workforce member toolkit (print to PDF)",
    contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
  },
];

export function getIssueTemplate(areaOrSlug: string): AdvocacyIssueTemplate | undefined {
  const key = areaOrSlug.toUpperCase().replace(/-/g, "_");
  return (
    ADVOCACY_ISSUE_TEMPLATES.find((t) => t.area === key) ??
    ADVOCACY_ISSUE_TEMPLATES.find((t) => t.slug === areaOrSlug)
  );
}

export function issueAreaLabel(area: AdvocacyIssueAreaId): string {
  const labels: Record<AdvocacyIssueAreaId, string> = {
    ACCESS_TO_CARE: "Access to care",
    MATERNAL_HEALTH: "Maternal health",
    WORKPLACE_VIOLENCE: "Workplace violence",
    BEHAVIORAL_HEALTH: "Behavioral health",
    SUBSTANCE_USE: "Substance use disorder",
    SDOH_FOOD_ACCESS: "SDOH & food access",
    PHYSICIAN_ACCESS: "Physician access",
    NURSING_WORKFORCE: "Nursing workforce",
  };
  return labels[area] ?? area;
}
