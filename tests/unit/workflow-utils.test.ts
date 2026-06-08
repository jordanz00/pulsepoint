import { describe, expect, it } from "vitest";
import { resolveStages, stepsToStages } from "@/lib/crm/workflow-utils";

describe("workflow utils", () => {
  it("derives stages from legacy steps", () => {
    const stages = resolveStages([], [
      { id: "a", order: 0, type: "task", label: "Step A" },
      { id: "b", order: 1, type: "task", label: "Step B" },
    ]);
    expect(stages).toHaveLength(2);
    expect(stages[0]!.label).toBe("Step A");
  });

  it("prefers explicit stages json", () => {
    const stages = resolveStages(
      [{ id: "x", order: 0, label: "Stage X" }],
      [{ id: "a", order: 0, type: "task", label: "Ignored" }],
    );
    expect(stages[0]!.id).toBe("x");
  });

  it("maps steps to stages", () => {
    const stages = stepsToStages([
      { id: "1", order: 0, type: "task", label: "One" },
    ]);
    expect(stages[0]!.label).toBe("One");
  });
});
