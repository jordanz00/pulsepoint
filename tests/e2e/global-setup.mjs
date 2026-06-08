import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export default async function globalSetup() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  execSync("pnpm demo:setup", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      DEMO_MODE: "true",
      DEMO_SESSION_SECRET:
        process.env.DEMO_SESSION_SECRET ??
        "playwright-e2e-demo-secret-32-chars-min",
      DATABASE_URL: "file:./prisma/demo.db",
      PAYMENT_ADAPTER: "manual",
    },
  });
}
