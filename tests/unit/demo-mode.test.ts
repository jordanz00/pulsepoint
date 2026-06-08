/**
 * Demo-mode HMAC cookie + env gating.
 *
 * NOTE: We don't import lib/demo-mode at module scope because it calls
 * `assertDemoModeNotInProduction()` at import time. We re-import after
 * setting envs to exercise the gates.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DEMO_MODE", "true");
  vi.stubEnv("DEMO_SESSION_SECRET", "x".repeat(32));
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function load() {
  return await import("@/lib/demo-mode");
}

describe("demo-mode env gates", () => {
  it("isDemoModeEnabled true with all flags set in non-prod", async () => {
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(true);
  });

  it("is disabled in production without hosted preview flag", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("HOSTED_DEMO", "");
    vi.stubEnv("DEMO_MODE", "false"); // critical: we cannot import w/ true+prod
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(false);
  });

  it("enables on Vercel Preview when HOSTED_DEMO=true", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("HOSTED_DEMO", "true");
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(true);
  });

  it("is disabled when DEMO_MODE is unset", async () => {
    vi.stubEnv("DEMO_MODE", "");
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(false);
  });

  it("is disabled when secret is too short", async () => {
    vi.stubEnv("DEMO_SESSION_SECRET", "short");
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(false);
  });

  it("is disabled when Entra integration profile is active", async () => {
    vi.stubEnv("INTEGRATION_PROFILE", "pilot-entra");
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(false);
  });
});

describe("demo-mode cookie sign/verify", () => {
  it("verifies a freshly signed cookie", async () => {
    const mod = await load();
    const cookie = mod.signDemoCookie();
    expect(mod.verifyDemoCookie(cookie)).toBe(true);
  });

  it("rejects a tampered cookie", async () => {
    const mod = await load();
    const cookie = mod.signDemoCookie();
    const [payload] = cookie.split(".");
    const tampered = `${payload}.AAAA`;
    expect(mod.verifyDemoCookie(tampered)).toBe(false);
  });

  it("rejects a cookie signed with a different secret", async () => {
    const mod = await load();
    const cookie = mod.signDemoCookie();
    vi.stubEnv("DEMO_SESSION_SECRET", "y".repeat(32));
    vi.resetModules();
    const mod2 = await load();
    expect(mod2.verifyDemoCookie(cookie)).toBe(false);
  });

  it("rejects an empty / malformed cookie", async () => {
    const mod = await load();
    expect(mod.verifyDemoCookie(undefined)).toBe(false);
    expect(mod.verifyDemoCookie("")).toBe(false);
    expect(mod.verifyDemoCookie("nope")).toBe(false);
    expect(mod.verifyDemoCookie("only.one.dot.too.many")).toBe(false);
  });

  it("rejects an expired cookie", async () => {
    const mod = await load();
    const longAgo = Date.now() - 2 * mod.DEMO_COOKIE_MAX_AGE_SECONDS * 1000;
    const cookie = mod.signDemoCookie(longAgo);
    expect(mod.verifyDemoCookie(cookie)).toBe(false);
  });
});

describe("demo-mode production refusal", () => {
  it("assertDemoModeNotInProduction throws on Vercel Production with DEMO_MODE", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("HOSTED_DEMO", "");
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const gates = await import("@/lib/demo-mode-gates");
    expect(() => gates.assertDemoModeNotInProduction()).toThrow(
      /DEMO_MODE_IN_PRODUCTION/,
    );
  });

  it("assertDemoModeNotInProduction allows Vercel Preview + HOSTED_DEMO", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("HOSTED_DEMO", "true");
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const gates = await import("@/lib/demo-mode-gates");
    expect(() => gates.assertDemoModeNotInProduction()).not.toThrow();
  });

  it("signDemoCookie refuses to mint on Vercel Production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("HOSTED_DEMO", "");
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const mod = await load();
    expect(() => mod.signDemoCookie()).toThrow(/DEMO_MODE_IN_PRODUCTION/);
  });

  it("signDemoCookie works on Vercel Preview + HOSTED_DEMO", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("HOSTED_DEMO", "true");
    vi.resetModules();
    const mod = await load();
    expect(mod.signDemoCookie()).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("getDemoSession returns null silently in production (no throw, gate-only)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const mod = await load();
    // Read path must not crash passive page renders / build-time prerender.
    await expect(mod.getDemoSession()).resolves.toBeNull();
  });
});
