import { describe, expect, it } from "vitest";
import { redactForAudit } from "@/lib/security/audit-redact";

describe("redactForAudit", () => {
  it("redacts sensitive keys", () => {
    const out = redactForAudit({
      email: "user@example.com",
      action: "member.update",
      phone: "555-0100",
    }) as Record<string, unknown>;
    expect(out.email).toBe("[REDACTED]");
    expect(out.phone).toBe("[REDACTED]");
    expect(out.action).toBe("member.update");
  });

  it("summarizes NPI arrays", () => {
    const out = redactForAudit({
      npis: ["1234567890", "9876543210"],
    }) as Record<string, unknown>;
    expect(out.npis).toEqual({
      count: 2,
      sample: ["XXXXXX7890", "XXXXXX3210"],
    });
  });
});
