import { describe, expect, it } from "vitest";
import { buildAdminNav, NAV_GROUP_ORDER } from "@/lib/nav-config";
import { buildNavigationSearchIndex, filterSearchIndex } from "@/lib/navigation/search-index";
import { buildNavShortcuts } from "@/lib/navigation/shortcuts";

describe("enterprise navigation", () => {
  it("groups items into logical IA sections", () => {
    const nav = buildAdminNav("demo-healthcare");
    for (const item of nav) {
      expect(NAV_GROUP_ORDER).toContain(item.group);
    }
    expect(nav.find((n) => n.id === "intelligence")?.group).toBe("command");
    expect(nav.find((n) => n.id === "members")?.group).toBe("membership");
    expect(nav.find((n) => n.id === "commerce")?.group).toBe("revenue");
  });

  it("indexes pages and shortcuts for global search", () => {
    const nav = buildAdminNav("demo-org");
    const index = buildNavigationSearchIndex("demo-org", nav);
    expect(index.some((i) => i.label === "MemberCore")).toBe(true);
    expect(index.some((i) => i.label === "Add member")).toBe(true);
    const hits = filterSearchIndex(index, "renewal");
    expect(hits.length).toBeGreaterThan(0);
  });

  it("exposes keyboard shortcuts for common actions", () => {
    const shortcuts = buildNavShortcuts("demo-org");
    expect(shortcuts.some((s) => s.id === "add-member" && s.shortcut === "⌘N")).toBe(true);
    expect(shortcuts.some((s) => s.id === "intelligence")).toBe(true);
  });
});
