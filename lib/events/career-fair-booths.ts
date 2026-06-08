/**
 * Virtual career fair booths — alpha demo (BL-026).
 * Booth chat / live video = roadmap. Data from micrositeConfig or event sponsors.
 */

export type CareerFairBooth = {
  id: string;
  employerName: string;
  boothNumber: string;
  pitch: string;
  rolesHiring: string;
  logoUrl?: string;
  websiteUrl?: string;
};

export type CareerFairMicrositeConfig = {
  careerFair?: {
    booths?: CareerFairBooth[];
    disclaimer?: string;
  };
};

type SponsorRow = {
  id: string;
  name: string;
  tier: string;
  boothNumber: string;
  logoUrl: string;
  websiteUrl: string;
};

/** Parse booths from event microsite JSON or sponsor rows (honest alpha labels). */
export function resolveCareerFairBooths(
  micrositeConfig: unknown,
  sponsors: SponsorRow[] = [],
): CareerFairBooth[] {
  const cfg = micrositeConfig as CareerFairMicrositeConfig | null;
  if (cfg?.careerFair?.booths?.length) {
    return cfg.careerFair.booths.map((b, i) => ({
      id: b.id || `booth-${i}`,
      employerName: b.employerName,
      boothNumber: b.boothNumber,
      pitch: b.pitch,
      rolesHiring: b.rolesHiring,
      logoUrl: b.logoUrl,
      websiteUrl: b.websiteUrl,
    }));
  }

  return sponsors
    .filter((s) => s.boothNumber || s.name)
    .map((s) => ({
      id: s.id,
      employerName: s.name,
      boothNumber: s.boothNumber || "—",
      pitch: s.tier,
      rolesHiring: "See employer page",
      logoUrl: s.logoUrl || undefined,
      websiteUrl: s.websiteUrl || undefined,
    }));
}

export function careerFairDisclaimer(micrositeConfig: unknown): string {
  const cfg = micrositeConfig as CareerFairMicrositeConfig | null;
  return (
    cfg?.careerFair?.disclaimer ??
    "Alpha preview — employer booths are illustrative. Live chat and video rooms are roadmap."
  );
}
