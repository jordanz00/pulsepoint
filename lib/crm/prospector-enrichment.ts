/**
 * Nimble Prospector-style enrichment — firmographics, business insights, ICP fit.
 * Demo: deterministic rules from domain/company; production uses IT-approved data vendors.
 */

export type FirmographicProfile = {
  companyName: string;
  domain: string | null;
  industry: string;
  employeeCountRange: string;
  revenueRange: string;
  headquarters: string;
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  leadershipHint?: string;
  icpMatch: "strong" | "moderate" | "weak";
  icpReasons: string[];
  enrichedAt: string;
};

export type ProspectEnrichmentInput = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  linkedInUrl?: string | null;
  websiteUrl?: string | null;
  pageUrl?: string | null;
};

function domainFromEmail(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || /^(gmail|yahoo|hotmail|outlook)\./.test(domain)) return null;
  return domain;
}

function domainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return host.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function titleCase(s: string): string {
  return s
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferIndustry(domain: string, company: string): string {
  const blob = `${domain} ${company}`.toLowerCase();
  if (/hospital|health|medical|clinic|care|pharma|nurse/.test(blob)) return "Healthcare";
  if (/edu|university|college/.test(blob)) return "Education";
  if (/gov|state\.|county/.test(blob)) return "Government";
  if (/bank|capital|financial/.test(blob)) return "Financial services";
  if (domain.endsWith(".org")) return "Nonprofit";
  return "Professional services";
}

function inferSizeAndRevenue(seed: number): { employees: string; revenue: string } {
  const sizes = [
    { employees: "1–50", revenue: "Under $5M" },
    { employees: "51–200", revenue: "$5M–$25M" },
    { employees: "201–1,000", revenue: "$25M–$100M" },
    { employees: "1,001–5,000", revenue: "$100M–$500M" },
    { employees: "5,000+", revenue: "$500M+" },
  ];
  return sizes[seed % sizes.length]!;
}

function scoreIcp(industry: string, employees: string, company: string): {
  match: FirmographicProfile["icpMatch"];
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  if (industry === "Healthcare") {
    score += 2;
    reasons.push("Healthcare industry aligns with association mission");
  }
  if (industry === "Nonprofit") {
    score += 1;
    reasons.push("Nonprofit sector — common member and partner profile");
  }
  if (employees.includes("201") || employees.includes("1,001") || employees.includes("5,000")) {
    score += 1;
    reasons.push("Organization size suggests enterprise membership potential");
  }
  if (/system|hospital|association|medical/.test(company.toLowerCase())) {
    score += 1;
    reasons.push("Company name suggests provider or association adjacency");
  }

  if (score >= 3) return { match: "strong", reasons };
  if (score >= 1) return { match: "moderate", reasons: reasons.length ? reasons : ["Partial fit — verify with staff"] };
  return { match: "weak", reasons: ["Limited healthcare signals — confirm before outreach"] };
}

export function enrichProspect(input: ProspectEnrichmentInput): FirmographicProfile {
  const domain =
    domainFromEmail(input.email) ??
    domainFromUrl(input.websiteUrl) ??
    domainFromUrl(input.pageUrl) ??
    null;

  const companyName =
    input.company?.trim() ||
    (domain ? titleCase(domain.split(".")[0] ?? domain) : "Unknown organization");

  const seed = hashSeed(domain ?? companyName);
  const industry = inferIndustry(domain ?? "", companyName);
  const { employees, revenue } = inferSizeAndRevenue(seed);
  const { match, reasons } = scoreIcp(industry, employees, companyName);

  const slug = [input.firstName, input.lastName]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return {
    companyName,
    domain,
    industry,
    employeeCountRange: employees,
    revenueRange: revenue,
    headquarters: seed % 2 === 0 ? "United States (Northeast)" : "United States (Midwest)",
    socialProfiles: {
      website: domain ? `https://${domain}` : input.websiteUrl ?? undefined,
      linkedin:
        input.linkedInUrl ??
        (slug ? `https://www.linkedin.com/in/${slug}` : undefined),
      twitter: domain ? `https://twitter.com/${domain.split(".")[0]}` : undefined,
    },
    leadershipHint:
      input.jobTitle ||
      (input.email?.includes("ceo")
        ? "Executive leadership (CEO signal)"
        : "Leadership — verify on LinkedIn"),
    icpMatch: match,
    icpReasons: reasons,
    enrichedAt: new Date().toISOString(),
  };
}

export function parseEnrichmentData(json: unknown): FirmographicProfile | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (typeof o.companyName !== "string" || typeof o.industry !== "string") return null;
  return o as unknown as FirmographicProfile;
}
