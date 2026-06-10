import { test, expect } from "@playwright/test";
import { enterDemo, DEMO_SLUG } from "./helpers/demo";

test.describe("flagship hub", () => {
  test.skip(
    process.env.DEMO_MODE !== "true",
    "Set DEMO_MODE=true and run pnpm db:seed:demo",
  );

  test.beforeEach(async ({ page }) => {
    await enterDemo(page);
  });

  test("flagship hub loads five feature cards", async ({ page }) => {
    await page.goto(`/${DEMO_SLUG}/flagship`, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Flagship features/i }),
    ).toBeVisible({ timeout: 15_000 });

    const grid = page.getByRole("list", { name: "Flagship features" });
    await expect(grid.getByRole("heading", { name: "Executive Command Center" })).toBeVisible();
    await expect(grid.getByRole("heading", { name: "Membership Intelligence" })).toBeVisible();
    await expect(grid.getByRole("heading", { name: "Advocacy on One Roster" })).toBeVisible();
    await expect(grid.getByRole("heading", { name: "Board Briefing Pack" })).toBeVisible();
    await expect(
      grid.getByRole("heading", { name: "Migration Without Rip-and-Replace" }),
    ).toBeVisible();
  });

  test("executive hub deep-link works", async ({ page }) => {
    await page.goto(`/${DEMO_SLUG}/flagship/executive`, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Executive Command Center/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("navigation", { name: "Demo routes" }).getByRole("link", {
        name: /Command center/i,
      }),
    ).toBeVisible();
  });
});
