import type { MemberPulseDimensionId } from "@/lib/member-pulse/types";

export { MEMBER_PULSE_DIMENSION_IDS } from "@/lib/member-pulse/types";

export const MEMBER_PULSE_DIMENSION_META: Record<
  MemberPulseDimensionId,
  { label: string; description: string; accent: string }
> = {
  association: {
    label: "Association",
    description: "Overall relationship with your association — rollup of activity and membership health.",
    accent: "var(--hap-topic-policy)",
  },
  comms: {
    label: "Comms team",
    description: "Email touches, meetings, and marketing engagement with communications staff.",
    accent: "var(--hap-topic-access)",
  },
  advocacy: {
    label: "Advocacy",
    description: "Policy outreach, grassroots activity, deals, and advocacy-tagged interactions.",
    accent: "var(--hap-topic-policy)",
  },
  board: {
    label: "Board & leadership",
    description: "Governance roles, executive leadership, and board relationship workflows.",
    accent: "var(--hap-topic-finance)",
  },
  events: {
    label: "Events",
    description: "Registration, attendance, speaking, panels, and moderating at programs.",
    accent: "var(--hap-topic-access)",
  },
};

/** Note channels counted toward each team */
export const COMMS_CHANNELS = new Set([
  "email",
  "call",
  "meeting",
  "linkedin",
  "in_person",
  "other",
  "prospector",
  "prospector_extension",
]);

export const ADVOCACY_CHANNELS = new Set(["advocacy", "policy", "legislative", "grassroots"]);

export const BOARD_CHANNELS = new Set(["board", "governance", "executive"]);

export const SPEAKER_ROLE_WEIGHT: Record<string, number> = {
  KEYNOTE: 25,
  SPEAKER: 20,
  PANELIST: 18,
  MODERATOR: 15,
};
