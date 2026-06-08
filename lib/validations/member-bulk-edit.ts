import { z } from "zod";
import { MEMBER_BULK_EDIT_FIELDS } from "@/lib/crm/bulk-edit-fields";

const fieldIds = MEMBER_BULK_EDIT_FIELDS.map((f) => f.id) as [string, ...string[]];

export const memberBulkEditSchema = z.object({
  memberIds: z.array(z.string().min(1)).min(1).max(500),
  field: z.enum(fieldIds),
  action: z.enum(["remove", "replace", "set"]),
  findMode: z.enum(["specific", "all", "empty"]),
  findValue: z.string().max(500).optional(),
  replaceValue: z.string().max(500).optional(),
  useRegex: z.boolean().optional(),
  dryRun: z.boolean().optional(),
});

export type MemberBulkEditInput = z.infer<typeof memberBulkEditSchema>;
