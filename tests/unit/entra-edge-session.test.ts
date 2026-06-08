import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "x".repeat(32);

function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signTestToken(exp: number): string {
  const json = JSON.stringify({ v: 1, exp });
  const sig = crypto.createHmac("sha256", SECRET).update(json).digest();
  return `${base64url(json)}.${base64url(sig)}`;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("entra-edge-session", () => {
  it("verifies a valid token", async () => {
    const mod = await import("@/lib/entra-edge-session");
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = signTestToken(exp);
    await expect(mod.verifyEntraSessionEdge(token, SECRET)).resolves.toBe(true);
  });

  it("rejects expired token", async () => {
    const mod = await import("@/lib/entra-edge-session");
    const exp = Math.floor(Date.now() / 1000) - 60;
    const token = signTestToken(exp);
    await expect(mod.verifyEntraSessionEdge(token, SECRET)).resolves.toBe(false);
  });

  it("rejects tampered token", async () => {
    const mod = await import("@/lib/entra-edge-session");
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = signTestToken(exp);
    const [body] = token.split(".");
    await expect(mod.verifyEntraSessionEdge(`${body}.AAAA`, SECRET)).resolves.toBe(
      false,
    );
  });

  it("rejects short secret", async () => {
    const mod = await import("@/lib/entra-edge-session");
    const token = signTestToken(Math.floor(Date.now() / 1000) + 3600);
    await expect(mod.verifyEntraSessionEdge(token, "short")).resolves.toBe(false);
  });
});
