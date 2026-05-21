import { describe, expect, it } from "vitest";
import { metadataMatchesRegistration } from "@/lib/webhook-trust";

describe("webhook metadata trust", () => {
  const reg = {
    id: "reg_1",
    orgId: "org_a",
    eventId: "evt_1",
  };

  it("accepts matching metadata", () => {
    expect(
      metadataMatchesRegistration(reg, {
        registrationId: "reg_1",
        orgId: "org_a",
        eventId: "evt_1",
      }),
    ).toBe(true);
  });

  it("rejects forged orgId", () => {
    expect(
      metadataMatchesRegistration(reg, {
        registrationId: "reg_1",
        orgId: "org_evil",
        eventId: "evt_1",
      }),
    ).toBe(false);
  });

  it("rejects forged registrationId", () => {
    expect(
      metadataMatchesRegistration(reg, {
        registrationId: "reg_other",
        orgId: "org_a",
      }),
    ).toBe(false);
  });
});
