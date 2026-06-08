import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function load() {
  return import("@/lib/integration-profile-gates");
}

describe("integration-profile-gates", () => {
  it("detects pilot-entra profile", async () => {
    vi.stubEnv("INTEGRATION_PROFILE", "pilot-entra");
    const mod = await load();
    expect(mod.isEntraIntegrationProfileEnv()).toBe(true);
    expect(mod.isEntraPilotMiddlewareEnv()).toBe(false);
  });

  it("requires entra session secret for middleware", async () => {
    vi.stubEnv("INTEGRATION_PROFILE", "pilot-entra");
    vi.stubEnv("ENTRA_SESSION_SECRET", "x".repeat(32));
    const mod = await load();
    expect(mod.isEntraPilotMiddlewareEnv()).toBe(true);
  });

  it("defaults to demo profile", async () => {
    vi.stubEnv("INTEGRATION_PROFILE", "");
    const mod = await load();
    expect(mod.isEntraIntegrationProfileEnv()).toBe(false);
  });
});
