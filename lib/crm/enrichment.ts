/**
 * Contact enrichment — business/social context on member profiles.
 * Demo: rule-based suggestions from name/email domain; production would call IT-approved APIs.
 */

export type EnrichmentSuggestion = {
  field: "company" | "jobTitle" | "linkedInUrl" | "websiteUrl";
  value: string;
  source: string;
  confidence: "high" | "medium" | "low";
};

function domainFromEmail(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || domain.endsWith("gmail.com") || domain.endsWith("yahoo.com")) return null;
  return domain;
}

function titleCaseCompany(domain: string): string {
  const base = domain.split(".")[0] ?? domain;
  return base
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function suggestEnrichment(input: {
  firstName: string;
  lastName: string;
  email?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  linkedInUrl?: string | null;
  websiteUrl?: string | null;
}): EnrichmentSuggestion[] {
  const out: EnrichmentSuggestion[] = [];
  const domain = domainFromEmail(input.email);

  if (domain && !input.company) {
    out.push({
      field: "company",
      value: titleCaseCompany(domain),
      source: `Inferred from email domain @${domain}`,
      confidence: "medium",
    });
  }

  if (!input.linkedInUrl) {
    const slug = `${input.firstName}-${input.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    out.push({
      field: "linkedInUrl",
      value: `https://www.linkedin.com/in/${slug}`,
      source: "Suggested LinkedIn search URL (verify before saving)",
      confidence: "low",
    });
  }

  if (!input.jobTitle && input.email?.includes("ceo")) {
    out.push({
      field: "jobTitle",
      value: "Chief Executive Officer",
      source: "Inferred from email local-part",
      confidence: "low",
    });
  }

  if (domain && !input.websiteUrl) {
    out.push({
      field: "websiteUrl",
      value: `https://${domain}`,
      source: `Website from email domain`,
      confidence: "medium",
    });
  }

  return out;
}
