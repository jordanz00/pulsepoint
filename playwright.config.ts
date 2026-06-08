import { defineConfig, devices } from "@playwright/test";

process.env.DEMO_MODE ??= "true";
process.env.DEMO_SESSION_SECRET ??= "playwright-e2e-demo-secret-32-chars-min";
process.env.DATABASE_URL ??= "file:./prisma/demo.db";
process.env.PAYMENT_ADAPTER ??= "manual";

const e2eEnv = {
  DEMO_MODE: "true",
  DEMO_SESSION_SECRET:
    process.env.DEMO_SESSION_SECRET ??
    "playwright-e2e-demo-secret-32-chars-min",
  DATABASE_URL: "file:./prisma/demo.db",
  PAYMENT_ADAPTER: "manual",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.mjs",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          ...e2eEnv,
        },
      },
});
