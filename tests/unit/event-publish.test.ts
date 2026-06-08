import { describe, expect, it } from "vitest";
import { getEventPublishReadiness } from "@/lib/events/publish-readiness";
import {
  buildEventRegistrationUrl,
  eventRegistrationPath,
} from "@/lib/events/registration-url";

describe("event publish readiness", () => {
  it("passes when title, date, and slug are valid", () => {
    const r = getEventPublishReadiness({
      title: "Annual Forum",
      startsAt: new Date("2026-09-15T09:00:00"),
      publicSlug: "annual-forum-2026",
    });
    expect(r.ready).toBe(true);
    expect(r.blockers).toHaveLength(0);
  });

  it("blocks publish when slug is invalid", () => {
    const r = getEventPublishReadiness({
      title: "Annual Forum",
      startsAt: new Date("2026-09-15T09:00:00"),
      publicSlug: "Bad Slug!",
    });
    expect(r.ready).toBe(false);
    expect(r.blockers.length).toBeGreaterThan(0);
  });
});

describe("event registration URL helpers", () => {
  it("builds org-scoped public path", () => {
    expect(eventRegistrationPath("demo-healthcare", "spring-gala")).toBe(
      "/demo-healthcare/e/spring-gala",
    );
  });

  it("builds absolute registration URL with app base", () => {
    const url = buildEventRegistrationUrl("demo-healthcare", "spring-gala");
    expect(url).toContain("/demo-healthcare/e/spring-gala");
  });
});
