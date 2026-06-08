import { describe, expect, it } from "vitest";
import {
  filterMembersByAudience,
  memberHasTag,
} from "@/lib/engage/recipient-filter";

describe("engage recipient filter", () => {
  it("matches tag in JSON array", () => {
    expect(memberHasTag(["board", "hospital-executive"], "hospital-executive")).toBe(true);
  });

  it("matches tag in stringified JSON", () => {
    expect(memberHasTag('["board"]', "board")).toBe(true);
  });

  it("rejects missing tag", () => {
    expect(memberHasTag(["member"], "board")).toBe(false);
  });

  it("filters by status and tag together", () => {
    const pool = [
      { email: "a@x.com", tags: ["hospital-executive"], status: "ACTIVE" as const },
      { email: "b@x.com", tags: ["hospital-executive"], status: "INACTIVE" as const },
      { email: "c@x.com", tags: ["board"], status: "ACTIVE" as const },
    ];
    const out = filterMembersByAudience(pool, {
      status: "ACTIVE",
      tag: "hospital-executive",
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.email).toBe("a@x.com");
  });

  it("filters by workforcePersona", () => {
    const pool = [
      { email: "a@x.com", tags: [], status: "ACTIVE" as const, workforcePersona: "STUDENT" },
      { email: "b@x.com", tags: [], status: "ACTIVE" as const, workforcePersona: "NEW_GRAD" },
    ];
    const out = filterMembersByAudience(pool, { workforcePersona: "STUDENT" });
    expect(out).toHaveLength(1);
    expect(out[0]?.email).toBe("a@x.com");
  });
});
