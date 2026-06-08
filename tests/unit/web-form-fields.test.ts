import { describe, expect, it } from "vitest";
import { normalizeFormPayload, parseWebFormFields } from "@/lib/crm/web-form-fields";

describe("web form fields", () => {
  it("parses default fields when json invalid", () => {
    const fields = parseWebFormFields(null);
    expect(fields.some((f) => f.id === "email")).toBe(true);
  });

  it("requires email format", () => {
    const fields = parseWebFormFields([
      { id: "email", label: "Email", type: "email", required: true },
    ]);
    expect(() => normalizeFormPayload(fields, { email: "not-an-email" })).toThrow(/Invalid email/);
  });

  it("normalizes valid payload", () => {
    const fields = parseWebFormFields([
      { id: "firstName", label: "First", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
    ]);
    const out = normalizeFormPayload(fields, { firstName: "Ada", email: "ada@example.com" });
    expect(out.email).toBe("ada@example.com");
  });
});
