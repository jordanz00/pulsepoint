import { describe, expect, it } from "vitest";
import { z } from "zod";

const bulkAssignSchema = z.object({
  memberIds: z.array(z.string().cuid()).min(1).max(200),
  organizationAccountId: z.string().cuid(),
});

describe("member bulk assign schema", () => {
  it("accepts valid assign payload", () => {
    const parsed = bulkAssignSchema.safeParse({
      memberIds: ["ckl8a7z8e0000qzrmn8311i7"],
      organizationAccountId: "ckl8a7z8e0000qzrmn8311i8",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty member list", () => {
    const parsed = bulkAssignSchema.safeParse({
      memberIds: [],
      organizationAccountId: "ckl8a7z8e0000qzrmn8311i8",
    });
    expect(parsed.success).toBe(false);
  });
});
