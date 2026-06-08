import { describe, expect, it } from "vitest";
import { selectTopInsights } from "@/lib/intelligence/build-org-insights";
import type { OrgInsight } from "@/lib/intelligence/types";

const sample: OrgInsight[] = [
  {
    id: "a",
    domain: "membership",
    priority: "info",
    title: "Stable",
    action: "No action needed.",
    href: "/demo",
  },
  {
    id: "b",
    domain: "events",
    priority: "urgent",
    title: "3 events with no registrations",
    action: "Promote registration.",
    href: "/demo/events",
    metricValue: 3,
    metricLabel: "Events",
  },
  {
    id: "c",
    domain: "committees",
    priority: "important",
    title: "2 empty committees",
    action: "Assign members.",
    href: "/demo/committees",
  },
];

describe("AMS Intelligence engine", () => {
  it("prioritizes urgent insights first", () => {
    const top = selectTopInsights(sample, 2);
    expect(top[0]?.priority).toBe("urgent");
    expect(top[1]?.priority).toBe("important");
  });

  it("caps insight count", () => {
    expect(selectTopInsights(sample, 1)).toHaveLength(1);
  });
});
