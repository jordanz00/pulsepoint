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

  it("is disabled in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "false"); // critical: we cannot import w/ true+prod
    vi.resetModules();
    const mod = await load();
    expect(mod.isDemoModeEnabled()).toBe(false);
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
  it("assertDemoModeNotInProduction throws if both prod+demo", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    await expect(load()).rejects.toThrow(/DEMO_MODE_IN_PRODUCTION/);
  });
});
