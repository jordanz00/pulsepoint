/**
 * Illustrative workforce CE / career-fair videos for portfolio demo.
 * validationStatus: illustrative_only — replace with association-hosted URLs in production.
 */

export type WorkforceShowcaseVideo = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  ceEligible: boolean;
  /** YouTube embed path segment (no user input — allowlisted static IDs) */
  youtubeId: string;
  trackSlug: "nursing" | "allied-health" | "physician";
};

export const WORKFORCE_SHOWCASE_VIDEOS: WorkforceShowcaseVideo[] = [
  {
    id: "nursing-pathways",
    title: "Nursing pathways — from student to bedside",
    description:
      "How hospital associations connect students, preceptors, and member employers through pipeline programs.",
    durationMin: 6,
    ceEligible: false,
    youtubeId: "rQ6GoY2_U24",
    trackSlug: "nursing",
  },
  {
    id: "loan-forgiveness",
    title: "Loan forgiveness & retention incentives",
    description:
      "Plain-language overview of common incentive programs — illustrative until SME review.",
    durationMin: 9,
    ceEligible: true,
    youtubeId: "Zqxf1H1a1Qc",
    trackSlug: "nursing",
  },
  {
    id: "virtual-career-fair",
    title: "Virtual career fair walkthrough",
    description:
      "What a member-facing career fair looks like — booths, playlists, and employer sign-on.",
    durationMin: 4,
    ceEligible: false,
    youtubeId: "9No-FiEInLA",
    trackSlug: "allied-health",
  },
];

export function workforceEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;
}
