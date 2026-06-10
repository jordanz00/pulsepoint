import { describe, expect, it } from "vitest";
import { renderBoardPackLeadershipLoopSection } from "@/lib/board-pack/leadership-loop-section";

describe("board pack leadership loop section", () => {
  it("renders all seven steps with org paths", () => {
    const html = renderBoardPackLeadershipLoopSection("demo-healthcare");
    expect(html).toContain("Leadership loop");
    expect(html).toContain("/demo-healthcare/leadership");
    expect(html).toContain("Member self-service");
    expect(html).toContain("Board pack");
  });
});
