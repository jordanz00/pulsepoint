import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}`;
    const r1 = checkRateLimit(key, 3, 60_000);
    const r2 = checkRateLimit(key, 3, 60_000);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });

  it("blocks after limit exceeded", () => {
    const key = `block-${Date.now()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const r3 = checkRateLimit(key, 2, 60_000);
    expect(r3.ok).toBe(false);
    if (!r3.ok) {
      expect(r3.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
