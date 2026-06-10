/**
 * Why PulsePoint flagship — static compare rows (illustrative only).
 */

import { STATEWIDE_HOSPITAL_MEMBER_COUNT } from "@/lib/marketing-constants";

export type FlagshipCompareStory = {
  id: string;
  legacy: string;
  pulse: string;
  pulseHighlight: string;
  legacyPanels: { title: string; lines: string[]; warn?: string }[];
  pulsePanels: { title: string; lines: string[]; badge?: string }[];
};

export const FLAGSHIP_COMPARE_STORIES: FlagshipCompareStory[] = [
  {
    id: "roster",
    legacy: "A different hospital list in every module",
    pulse: "One record—from dues to take-action",
    pulseHighlight: "1 roster",
    legacyPanels: [
      {
        title: "Members.xlsx",
        lines: [`${STATEWIDE_HOSPITAL_MEMBER_COUNT} hospitals`, "Last edited: March", "Missing PAC contacts"],
        warn: "Does not match advocacy list",
      },
      {
        title: "Advocacy_tracker.csv",
        lines: ["214 hospitals tagged", "Manual paste from email", "No renewal data"],
        warn: "38 hospitals missing",
      },
      {
        title: "Events export",
        lines: ["189 registrants", "Different naming", "Finance uses another file"],
      },
    ],
    pulsePanels: [
      {
        title: "MemberCore",
        lines: [
          `${STATEWIDE_HOSPITAL_MEMBER_COUNT} hospitals · one record`,
          "Advocacy · events · PAC on same row",
          "Search any executive in one place",
        ],
        badge: "Live",
      },
    ],
  },
  {
    id: "board",
    legacy: "Board numbers rebuilt in Excel every month",
    pulse: "Revenue and roster totals staff already use",
    pulseHighlight: "Same DB",
    legacyPanels: [
      {
        title: "Board_deck_v7.xlsx",
        lines: ["Revenue MTD: $241K", "Manual VLOOKUP", "Differs from staff report"],
        warn: "Finance vs membership mismatch",
      },
      {
        title: "Staff dashboard",
        lines: ["Revenue MTD: $284K", "Not exported to board file"],
      },
    ],
    pulsePanels: [
      {
        title: "Insights · executive KPIs",
        lines: ["$284K revenue MTD", "94% renewal health", "Export matches staff ops"],
        badge: "Live",
      },
    ],
  },
  {
    id: "advocacy",
    legacy: "Advocacy tracked in a side spreadsheet",
    pulse: "See which hospitals have not acted yet",
    pulseHighlight: "Roster-linked",
    legacyPanels: [
      {
        title: "GR spreadsheet",
        lines: ["428 responses (maybe)", "No link to roster", "Chasing CEOs by email"],
        warn: "Cannot see who has not acted",
      },
    ],
    pulsePanels: [
      {
        title: "Take-action campaign",
        lines: [
          "428 responses on roster",
          "72% of members engaged",
          "Filter hospitals with no response",
        ],
        badge: "Live",
      },
    ],
  },
  {
    id: "scope",
    legacy: "Hard to tell what is live vs promised",
    pulse: "Every screen labeled Live or Preview",
    pulseHighlight: "100% labeled",
    legacyPanels: [
      {
        title: "Vendor roadmap slide",
        lines: ["“Available now”", "Hidden beta modules", "Custom demo environment"],
        warn: "Scope unclear until contract",
      },
    ],
    pulsePanels: [
      {
        title: "PulsePoint demo",
        lines: ["Live badge on shipped modules", "Preview on in-flight work", "Honest compare page"],
        badge: "100% labeled",
      },
    ],
  },
];
