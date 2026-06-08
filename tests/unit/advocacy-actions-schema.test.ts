import { describe, expect, it } from "vitest";
import { z } from "zod";

const issueInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  jurisdiction: z.enum(["STATE", "FEDERAL", "BOTH"]).default("STATE"),
});

describe("advocacy action schemas", () => {
  it("accepts valid issue input", () => {
    const parsed = issueInputSchema.safeParse({
      title: "340B protections",
      jurisdiction: "FEDERAL",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty issue title", () => {
    const parsed = issueInputSchema.safeParse({ title: " ", jurisdiction: "STATE" });
    expect(parsed.success).toBe(false);
  });
});
