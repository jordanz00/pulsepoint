import { z } from "zod";

export const memberStatusSchema = z.enum(["ACTIVE", "INACTIVE", "LAPSED"]);

export const memberInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  status: memberStatusSchema.optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  linkedInUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  relationshipHealth: z
    .enum(["STRONG", "STEADY", "COOLING", "AT_RISK"])
    .optional(),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
  tierId: z.string().trim().max(64).optional().or(z.literal("")),
  renewalDueAt: z.string().optional().or(z.literal("")),
  organizationAccountId: z.string().trim().max(64).optional().or(z.literal("")),
});

export type MemberInput = z.infer<typeof memberInputSchema>;

export const roleFilterPresetSchema = z.enum([
  "ceo",
  "cfo",
  "coo",
  "c_suite",
  "our_board",
  "external_board",
  "senior_leadership",
  "committee",
  "staff",
]);

export const roleFilterModeSchema = z.enum(["include", "exclude"]);

export const engagementTierSchema = z.enum([
  "active",
  "moderate",
  "at_risk",
  "inactive",
]);

export const memberSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: memberStatusSchema.optional(),
  rolePreset: roleFilterPresetSchema.optional(),
  roleMode: roleFilterModeSchema.optional(),
  engagementTier: engagementTierSchema.optional(),
});

export type MemberSearchInput = z.infer<typeof memberSearchSchema>;

/** Turn `""` from HTML selects into `undefined` so optional enums validate. */
function queryValue(v: string | string[] | undefined): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Parse URL search params for MemberCore directory filters.
 * GET forms send empty string for "All …" options — must not fail the whole schema.
 */
export function parseMemberSearchFromQuery(
  raw: Record<string, string | string[] | undefined>,
): MemberSearchInput {
  const rolePreset = queryValue(raw.rolePreset);
  const roleMode = queryValue(raw.roleMode);

  const parsed = memberSearchSchema.safeParse({
    q: queryValue(raw.q),
    status: queryValue(raw.status),
    rolePreset,
    roleMode: roleMode ?? (rolePreset ? "include" : undefined),
    engagementTier: queryValue(raw.engagementTier),
  });

  if (parsed.success) return parsed.data;

  // Fallback: still apply role filter if only enum fields were polluted by ""
  const partial: MemberSearchInput = {};
  const q = queryValue(raw.q);
  if (q) partial.q = q;
  const status = queryValue(raw.status);
  if (status) {
    const s = memberStatusSchema.safeParse(status);
    if (s.success) partial.status = s.data;
  }
  if (rolePreset) {
    const p = roleFilterPresetSchema.safeParse(rolePreset);
    if (p.success) partial.rolePreset = p.data;
  }
  const mode = roleMode ?? (rolePreset ? "include" : undefined);
  if (mode) {
    const m = roleFilterModeSchema.safeParse(mode);
    if (m.success) partial.roleMode = m.data;
  }
  const tier = queryValue(raw.engagementTier);
  if (tier) {
    const t = engagementTierSchema.safeParse(tier);
    if (t.success) partial.engagementTier = t.data;
  }
  return partial;
}

/** Build query string for filter links (omits empty values). */
export function memberSearchToQueryString(params: MemberSearchInput): string {
  const parts = new URLSearchParams();
  if (params.q) parts.set("q", params.q);
  if (params.status) parts.set("status", params.status);
  if (params.rolePreset) {
    parts.set("rolePreset", params.rolePreset);
    parts.set("roleMode", params.roleMode ?? "include");
  }
  if (params.engagementTier) parts.set("engagementTier", params.engagementTier);
  const s = parts.toString();
  return s ? `?${s}` : "";
}
