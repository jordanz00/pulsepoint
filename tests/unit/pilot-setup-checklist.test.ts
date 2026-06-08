import { describe, expect, it } from "vitest";
import {
  buildPilotSetupChecklist,
  type PilotSetupSignals,
} from "@/lib/onboarding/pilot-setup-checklist";

function signals(overrides: Partial<PilotSetupSignals> = {}): PilotSetupSignals {
  return {
    memberCount: 0,
    staffCount: 1,
    eventCount: 0,
    publishedEventCount: 0,
    pendingImportCount: 0,
    confirmedRegistrationCount: 0,
    draftEventId: null,
    ...overrides,
  };
}

describe("pilot setup checklist", () => {
  it("shows checklist for empty org", () => {
    const checklist = buildPilotSetupChecklist("hap-pa", signals());
    expect(checklist.showChecklist).toBe(true);
    expect(checklist.isWedgeReady).toBe(false);
    expect(checklist.completedRequired).toBe(0);
    expect(checklist.requiredTotal).toBe(4);
  });

  it("hides checklist when wedge criteria met", () => {
    const checklist = buildPilotSetupChecklist(
      "hap-pa",
      signals({
        memberCount: 120,
        staffCount: 3,
        eventCount: 2,
        publishedEventCount: 1,
      }),
    );
    expect(checklist.isWedgeReady).toBe(true);
    expect(checklist.showChecklist).toBe(false);
    expect(checklist.completedRequired).toBe(4);
  });

  it("marks members done and links to imports when batch pending", () => {
    const checklist = buildPilotSetupChecklist(
      "hap-pa",
      signals({ pendingImportCount: 2 }),
    );
    const members = checklist.steps.find((s) => s.id === "members");
    expect(members?.done).toBe(false);
    expect(members?.href).toBe("/hap-pa/members/imports");
    expect(members?.detail).toContain("awaiting review");
  });

  it("links publish step to draft event when available", () => {
    const checklist = buildPilotSetupChecklist(
      "hap-pa",
      signals({ eventCount: 1, draftEventId: "evt_draft_1" }),
    );
    const publish = checklist.steps.find((s) => s.id === "event-publish");
    expect(publish?.href).toBe("/hap-pa/events/evt_draft_1");
    expect(publish?.done).toBe(false);
  });

  it("treats registration drill as optional", () => {
    const checklist = buildPilotSetupChecklist(
      "hap-pa",
      signals({
        memberCount: 10,
        staffCount: 2,
        eventCount: 1,
        publishedEventCount: 1,
      }),
    );
    const drill = checklist.steps.find((s) => s.id === "registration-drill");
    expect(drill?.required).toBe(false);
    expect(drill?.done).toBe(false);
    expect(checklist.showChecklist).toBe(false);
  });
});
