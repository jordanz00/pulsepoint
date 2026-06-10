import { describe, expect, it } from "vitest";
import { buildHealthSystemTrees } from "@/lib/enterprise/health-system-governance";

describe("buildHealthSystemTrees", () => {
  it("nests hospitals under health system parents", () => {
    const { trees, orphanHospitals } = buildHealthSystemTrees([
      {
        id: "sys-1",
        name: "Regional Health",
        type: "HEALTH_SYSTEM",
        parentId: null,
        memberCount: 2,
        childCount: 2,
      },
      {
        id: "hosp-1",
        name: "North Hospital",
        type: "HOSPITAL",
        parentId: "sys-1",
        memberCount: 5,
        childCount: 0,
      },
      {
        id: "hosp-2",
        name: "South Hospital",
        type: "HOSPITAL",
        parentId: "sys-1",
        memberCount: 3,
        childCount: 0,
      },
      {
        id: "hosp-3",
        name: "Standalone CAH",
        type: "CRITICAL_ACCESS",
        parentId: null,
        memberCount: 1,
        childCount: 0,
      },
    ]);

    expect(trees).toHaveLength(1);
    expect(trees[0].name).toBe("Regional Health");
    expect(trees[0].children).toHaveLength(2);
    expect(orphanHospitals).toHaveLength(1);
    expect(orphanHospitals[0].name).toBe("Standalone CAH");
  });
});
