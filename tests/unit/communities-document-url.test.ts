import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedCommunityDocumentUrl } from "@/lib/communities/document-url";

describe("isAllowedCommunityDocumentUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows https URLs", () => {
    expect(isAllowedCommunityDocumentUrl("https://example.org/docs/policy.pdf")).toBe(true);
  });

  it("rejects javascript and file schemes", () => {
    expect(isAllowedCommunityDocumentUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedCommunityDocumentUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects http in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedCommunityDocumentUrl("http://localhost/policy.pdf")).toBe(false);
  });

  it("allows http in development for local testing", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isAllowedCommunityDocumentUrl("http://localhost:3000/sample.pdf")).toBe(true);
  });

  it("rejects malformed URLs", () => {
    expect(isAllowedCommunityDocumentUrl("not-a-url")).toBe(false);
    expect(isAllowedCommunityDocumentUrl("")).toBe(false);
  });
});
