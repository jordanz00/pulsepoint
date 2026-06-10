/**
 * Marketing preview booths — mirrors seed-demo career fair (illustrative only).
 * Keep in sync with prisma/seed-demo.ts micrositeConfig.careerFair.booths.
 */

import type { CareerFairBooth } from "@/lib/events/career-fair-booths";

export const MARKETING_CAREER_FAIR_PREVIEW: {
  eventTitle: string;
  publicSlug: string;
  disclaimer: string;
  booths: CareerFairBooth[];
} = {
  eventTitle: "2026 Virtual Nursing & Allied Health Career Fair",
  publicSlug: "nursing-career-fair-2026",
  disclaimer: "Alpha preview — booth chat and live video are roadmap.",
  booths: [
    {
      id: "booth-1",
      employerName: "Sterling Regional Medical Center",
      boothNumber: "A1",
      pitch: "Magnet-designated system · new grad residency",
      rolesHiring: "RN, LPN, CNA",
    },
    {
      id: "booth-2",
      employerName: "North River Health Plan",
      boothNumber: "A2",
      pitch: "Integrated delivery · behavioral health expansion",
      rolesHiring: "Behavioral health RN, NP",
    },
    {
      id: "booth-3",
      employerName: "Summit Children's Hospital",
      boothNumber: "B1",
      pitch: "Pediatric specialty care across 3 campuses",
      rolesHiring: "PICU RN, RT",
    },
    {
      id: "booth-4",
      employerName: "Valley Community Hospital",
      boothNumber: "B2",
      pitch: "Critical access · loan forgiveness eligible",
      rolesHiring: "ED RN, Lab tech",
    },
    {
      id: "booth-5",
      employerName: "Keystone Academic Medical Center",
      boothNumber: "C1",
      pitch: "Teaching hospital · allied health fellowships",
      rolesHiring: "Allied health, Imaging",
    },
    {
      id: "booth-6",
      employerName: "Riverside Home Health",
      boothNumber: "C2",
      pitch: "Home-based care growth market",
      rolesHiring: "Home health RN, PT",
    },
  ],
};
