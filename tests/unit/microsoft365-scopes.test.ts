import { describe, expect, it } from "vitest";
import { M365_DELEGATED_SCOPES, M365_SCOPE_STRING } from "@/lib/adapters/microsoft365/scopes";

describe("Microsoft 365 scopes", () => {
  it("includes mail, calendar, and contacts for full sync", () => {
    expect(M365_DELEGATED_SCOPES).toContain("Mail.Read");
    expect(M365_DELEGATED_SCOPES).toContain("Calendars.Read");
    expect(M365_DELEGATED_SCOPES).toContain("Contacts.Read");
    expect(M365_SCOPE_STRING).toContain("Mail.Read");
  });
});
