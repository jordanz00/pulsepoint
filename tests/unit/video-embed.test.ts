import { describe, expect, it } from "vitest";
import { parseVideoEmbedUrl, workforceTrackLabel } from "@/lib/learn/video-embed";

describe("parseVideoEmbedUrl", () => {
  it("parses youtube watch URL", () => {
    const r = parseVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
    expect(r?.embedUrl).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("parses youtu.be short URL", () => {
    const r = parseVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(r?.embedUrl).toContain("dQw4w9WgXcQ");
  });

  it("parses vimeo URL", () => {
    const r = parseVideoEmbedUrl("https://vimeo.com/76979871");
    expect(r?.provider).toBe("vimeo");
    expect(r?.embedUrl).toBe("https://player.vimeo.com/video/76979871");
  });

  it("rejects arbitrary iframe hosts", () => {
    expect(parseVideoEmbedUrl("https://evil.example/embed/x")).toBeNull();
  });
});

describe("workforceTrackLabel", () => {
  it("labels nursing track", () => {
    expect(workforceTrackLabel("nursing")).toBe("Nursing");
  });
});
