import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production guards — entra profile", () => {
  it("flags DEMO_MODE with pilot-entra", async () => {
    vi.stubEnv("CRON_SECRET", "c".repeat(24));
    vi.stubEnv("INTEGRATION_PROFILE", "pilot-entra");
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("ENTRA_SESSION_SECRET", "e".repeat(32));
    const mod = await import("@/lib/security/production-guards");
    const result = mod.checkProductionSecurityConfig();
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("DEMO_MODE"))).toBe(true);
  });

  it("requires ENTRA_SESSION_SECRET when entra profile active", async () => {
    vi.stubEnv("CRON_SECRET", "c".repeat(24));
    vi.stubEnv("INTEGRATION_PROFILE", "pilot-entra");
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("ENTRA_SESSION_SECRET", "short");
    const mod = await import("@/lib/security/production-guards");
    const result = mod.checkProductionSecurityConfig();
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("ENTRA_SESSION_SECRET"))).toBe(
      true,
    );
  });
});
