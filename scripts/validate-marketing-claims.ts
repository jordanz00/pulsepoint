/**
 * CI guard: "available" marketing blocks must not over-claim roadmap capabilities.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { fileURLToPath } from "node:url";
const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const FILES = [
  "lib/marketing-content.ts",
  "lib/marketing-catalog.ts",
];

const FORBIDDEN_ON_AVAILABLE = [
  "automated renewals",
  "full sso",
  "power bi embed",
];

let failed = 0;

function checkFile(rel: string) {
  const text = readFileSync(resolve(ROOT, rel), "utf8");
  const parts = text.split(/status:\s*"available"/i);
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i]!.slice(0, 1200).toLowerCase();
    for (const phrase of FORBIDDEN_ON_AVAILABLE) {
      if (!block.includes(phrase)) continue;
      if (block.includes("roadmap")) continue;
      console.error(`FAIL ${rel}: "available" block mentions "${phrase}" without roadmap qualifier`);
      failed += 1;
    }
  }
}

for (const f of FILES) checkFile(f);

// coming_soon products must not be "available" in products.ts twin check
const products = readFileSync(resolve(ROOT, "lib/products.ts"), "utf8");
const roadmapIds = ["learn", "giving", "commerce", "engage", "insights"];
for (const id of roadmapIds) {
  const re = new RegExp(
    `id:\\s*"${id}"[\\s\\S]{0,400}status:\\s*"available"`,
    "m",
  );
  if (re.test(products)) {
    console.error(`FAIL lib/products.ts: roadmap product "${id}" marked available`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} marketing claim violation(s). See docs/PRODUCT-CLAIMS.md`);
  process.exit(1);
}
console.log("OK: Marketing claims align with PRODUCT-CLAIMS registry");
process.exit(0);
