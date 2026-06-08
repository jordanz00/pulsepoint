/**
 * MemberCore capability catalog — used on marketing and in-app hub.
 */

export type MemberCoreFeature = {
  id: string;
  title: string;
  description: string;
  /** Filter preset to deep-link directory */
  filterPreset?: string;
};

export const MEMBERCORE_CAPABILITIES: MemberCoreFeature[] = [
  {
    id: "directory",
    title: "Member directory",
    description:
      "Search by name or email, filter by status, and open any profile in one click—no buried menus.",
  },
  {
    id: "roles",
    title: "Governance & leadership roles",
    description:
      "CEO, C-suite, your board, external boards, and committees—current and historical, visible on every record.",
    filterPreset: "ceo",
  },
  {
    id: "engagement",
    title: "Engagement & MemberPulse",
    description:
      "See who is active, cooling, or at risk. Scores reflect events, dues, giving, learning, and email touchpoints.",
  },
  {
    id: "activity",
    title: "What they are doing now",
    description:
      "Registrations, orders, notes, and staff actions roll into a single timeline so you know the latest touch.",
  },
  {
    id: "bulk",
    title: "Bulk update & export",
    description:
      "Select a cohort, update fields in one pass, and export CSV for finance or board packets—audited on the way out.",
  },
  {
    id: "import",
    title: "Staged imports",
    description:
      "Upload spreadsheets, review every row, then apply—production data never changes until you approve.",
  },
  {
    id: "analytics",
    title: "Membership analytics",
    description:
      "Renewal pipeline, engagement tiers, dues breakdown, and hospital roster rollups—board-ready without exports.",
  },
];

export const MEMBERCORE_ROLE_GROUPS = [
  { label: "Executive", presets: ["ceo", "cfo", "coo", "c_suite"] as const },
  { label: "Governance", presets: ["our_board", "external_board", "committee"] as const },
  { label: "Operations", presets: ["staff", "senior_leadership"] as const },
] as const;
