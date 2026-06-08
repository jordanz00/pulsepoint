import { describe, expect, it, vi, afterEach } from "vitest";
import {
  checkProductionSecurityConfig,
  isCronAuthorized,
} from "@/lib/security/production-guards";

describe("production guards", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("requires CRON_SECRET in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.CRON_SECRET;
    const result = checkProductionSecurityConfig();
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("CRON_SECRET"))).toBe(true);
  });

  it("denies cron in production without bearer token", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "test-cron-secret-at-least-24-chars");
    const req = new Request("http://localhost/api/cron/platform");
    expect(isCronAuthorized(req)).toBe(false);
  });

  it("allows cron with valid bearer in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "test-cron-secret-at-least-24-chars");
    const req = new Request("http://localhost/api/cron/platform", {
      headers: { authorization: "Bearer test-cron-secret-at-least-24-chars" },
    });
    expect(isCronAuthorized(req)).toBe(true);
  });
});
