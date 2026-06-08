import { z } from "zod";

export const prospectEnrichSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().email().max(254).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  linkedInUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  pageUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
});

export const prospectNoteSchema = z.object({
  memberId: z.string().min(1),
  body: z.string().trim().min(1).max(5000),
  channel: z.string().trim().max(40).optional().or(z.literal("")),
  noteType: z.enum(["RELATIONSHIP", "FOLLOW_UP", "GENERAL"]).optional(),
});

export const prospectStayInTouchSchema = z.object({
  memberId: z.string().min(1),
  /** ISO date or preset: 7d | 30d | 90d */
  when: z.string().min(1).max(40),
});
