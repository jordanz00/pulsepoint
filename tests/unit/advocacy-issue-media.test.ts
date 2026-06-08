import { describe, expect, it } from "vitest";
import { resolveHeroImagePath, resolveToolkitPath } from "@/lib/advocacy/issue-media";

describe("advocacy issue media allowlist", () => {
  it("accepts toolkit paths under /advocacy-toolkits/", () => {
    expect(resolveToolkitPath("/advocacy-toolkits/nursing-workforce.html")).toBe(
      "/advocacy-toolkits/nursing-workforce.html",
    );
  });

  it("rejects external toolkit URLs", () => {
    expect(resolveToolkitPath("https://evil.example/toolkit.pdf")).toBeNull();
    expect(resolveToolkitPath("/other/nursing-workforce.html")).toBeNull();
  });

  it("accepts hero images under /advocacy-toolkits/", () => {
    expect(resolveHeroImagePath("/advocacy-toolkits/nursing-workforce-hero.svg")).toBe(
      "/advocacy-toolkits/nursing-workforce-hero.svg",
    );
  });

  it("rejects traversal paths", () => {
    expect(resolveToolkitPath("/advocacy-toolkits/../secret.html")).toBeNull();
  });
});
