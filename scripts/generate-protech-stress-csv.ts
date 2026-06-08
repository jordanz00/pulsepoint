/**
 * Generate a 1k-row Protech-style member CSV for import stress drills (Sprint D / G4).
 * Usage: pnpm import:stress-fixture
 */
import fs from "node:fs";
import path from "node:path";

const ROWS = Number(process.env.PROTECH_STRESS_ROWS ?? 1000);
const OUT = path.join(
  process.cwd(),
  "tests/fixtures/protech-member-export-1k.csv",
);

const HEADER =
  "firstName,lastName,email,phone,status,company,jobTitle,tierName,renewalDueAt,organizationName";

const TIERS = ["Full Member", "Associate", "Honorary", "Student"];
const HOSPITALS = [
  "Metro General Hospital",
  "Riverside Medical Center",
  "Summit Health System",
  "Valley Community Hospital",
  "Lakeside Regional Medical",
];

function renewalIso(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const lines = [HEADER];
for (let i = 1; i <= ROWS; i++) {
  const tier = TIERS[i % TIERS.length]!;
  const hospital = HOSPITALS[i % HOSPITALS.length]!;
  const status = i % 17 === 0 ? "LAPSED" : i % 11 === 0 ? "INACTIVE" : "ACTIVE";
  lines.push(
    [
      `Stress${i}`,
      `Member${i}`,
      `stress.member${i}@protech-import.example`,
      `555-${String(1000 + (i % 9000)).padStart(4, "0")}`,
      status,
      hospital,
      i % 5 === 0 ? "CEO" : "Director",
      tier,
      renewalIso(30 + (i % 180)),
      hospital,
    ].join(","),
  );
}

fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${ROWS} rows to ${OUT}`);
console.log("Import drill: /demo-healthcare/members/imports → upload → stage → review → apply");
