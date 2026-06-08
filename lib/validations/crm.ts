import { z } from "zod";

export const relationshipHealthSchema = z.enum(["STRONG", "STEADY", "COOLING", "AT_RISK"]);

export const memberCrmProfileSchema = z.object({
  company: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  linkedInUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  relationshipHealth: relationshipHealthSchema.optional(),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
});

export const memberRelationshipSchema = z.object({
  toMemberId: z.string().min(1),
  relationType: z.enum([
    "COLLEAGUE",
    "REFERRAL",
    "MENTOR",
    "MENTEE",
    "BOARD_PEER",
    "SPOUSE",
    "OTHER",
  ]),
  strength: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const webCaptureInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  linkedInUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  sourceLabel: z.string().trim().max(120).optional(),
  captureKind: z.enum(["WEB_CAPTURE", "LINKEDIN", "EMAIL_CAPTURE"]).default("WEB_CAPTURE"),
});
