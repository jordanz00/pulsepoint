import { z } from "zod";
import { ASSOCIATION_DEPARTMENT_IDS } from "@/lib/association/departments";

export const committeeKindSchema = z.enum([
  "STANDING",
  "ADVISORY",
  "TASK_FORCE",
  "COUNCIL",
]);

export const committeeOfficerRoleSchema = z.enum([
  "CHAIR",
  "VICE_CHAIR",
  "SECRETARY",
  "TREASURER",
  "MEMBER_AT_LARGE",
  "MEMBER",
]);

export const committeeInputSchema = z.object({
  name: z.string().min(2).max(120),
  kind: committeeKindSchema,
  departmentId: z.enum(ASSOCIATION_DEPARTMENT_IDS),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const committeeUpdateSchema = committeeInputSchema.partial().extend({
  id: z.string().min(1).max(64),
});

export const committeeMemberInputSchema = z.object({
  memberId: z.string().min(1).max(64),
  title: z.string().min(1).max(80).optional(),
  officerRole: committeeOfficerRoleSchema.optional(),
  termStart: z.string().max(32).optional(),
  termEnd: z.string().max(32).optional(),
});

export const committeeMemberUpdateSchema = z.object({
  membershipId: z.string().min(1).max(64),
  title: z.string().min(1).max(80).optional(),
  officerRole: committeeOfficerRoleSchema.optional(),
  termStart: z.string().max(32).optional(),
  termEnd: z.string().max(32).optional(),
});

export const committeeMeetingInputSchema = z.object({
  title: z.string().max(120).optional(),
  startsAt: z.string().min(1).max(40),
  endsAt: z.string().max(40).optional(),
  location: z.string().max(200).optional(),
  virtualUrl: z.union([z.string().url().max(500), z.literal("")]).optional(),
  agenda: z.string().max(2000).optional(),
});

export const committeeMeetingUpdateSchema = committeeMeetingInputSchema
  .partial()
  .extend({
    meetingId: z.string().min(1).max(64),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  });
