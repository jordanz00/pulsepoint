/**
 * Member CSV import — column detection and row parsing.
 */

export const MEMBER_IMPORT_TEMPLATE_HEADER =
  "firstName,lastName,email,phone,status,company,jobTitle,tierName,renewalDueAt,organizationName";

export type ParsedImportRow = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  memberStatus: "ACTIVE" | "INACTIVE" | "LAPSED" | null;
  tierName: string | null;
  renewalDueAt: Date | null;
  organizationName: string | null;
};

const COLUMN_ALIASES: Record<string, string[]> = {
  firstname: ["firstname", "first_name", "first"],
  lastname: ["lastname", "last_name", "last"],
  email: ["email", "e-mail"],
  phone: ["phone", "mobile", "telephone"],
  status: ["status", "memberstatus", "member_status"],
  company: ["company", "organization", "employer", "hospital"],
  jobtitle: ["jobtitle", "job_title", "title", "role"],
  tiername: ["tiername", "tier_name", "tier", "membershiptier", "dues_tier"],
  renewaldueat: ["renewaldueat", "renewal_due", "renewaldate", "renewal_date", "renewal"],
  organizationname: [
    "organizationname",
    "organization_name",
    "hospitalaccount",
    "hospital_account",
    "account",
    "healthsystem",
  ],
};

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/[\s-]+/g, "");
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else current += ch;
  }
  result.push(current.trim());
  return result;
}

export function buildColumnIndex(headerLine: string): Record<string, number> {
  const cols = parseCsvLine(headerLine).map(normalizeHeader);
  const index: Record<string, number> = {};

  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i]!;
      if (aliases.includes(c)) {
        index[canonical] = i;
        break;
      }
    }
  }

  return index;
}

function cell(parts: string[], idx: number | undefined): string {
  if (idx === undefined) return "";
  return parts[idx]?.trim() ?? "";
}

function parseMemberStatus(raw: string): ParsedImportRow["memberStatus"] {
  const s = raw.trim().toUpperCase();
  if (s === "ACTIVE" || s === "INACTIVE" || s === "LAPSED") return s;
  return null;
}

function parseRenewalDate(raw: string): Date | null {
  if (!raw.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseImportDataRow(
  parts: string[],
  col: Record<string, number>,
): ParsedImportRow | null {
  const firstName = cell(parts, col.firstname);
  const lastName = cell(parts, col.lastname);
  if (!firstName || !lastName) return null;

  const emailRaw = cell(parts, col.email).toLowerCase();
  const email = emailRaw && emailRaw.includes("@") ? emailRaw : null;

  return {
    firstName,
    lastName,
    email,
    phone: cell(parts, col.phone) || null,
    company: cell(parts, col.company) || null,
    jobTitle: cell(parts, col.jobtitle) || null,
    memberStatus: parseMemberStatus(cell(parts, col.status)),
    tierName: cell(parts, col.tiername) || null,
    renewalDueAt: parseRenewalDate(cell(parts, col.renewaldueat)),
    organizationName: cell(parts, col.organizationname) || null,
  };
}

export function memberImportTemplateCsv(): string {
  return [
    MEMBER_IMPORT_TEMPLATE_HEADER,
    "Jordan,Example,jordan@hospital.org,555-0100,ACTIVE,Metro Health System,CEO,Full Member,2026-12-31,Metro Health System",
    "Alex,Sample,alex@northriver.org,,ACTIVE,North River Medical Center,CNO,Associate,2026-06-30,North River Medical Center",
  ].join("\n");
}
