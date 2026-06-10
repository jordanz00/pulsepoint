import { test, expect } from "@playwright/test";
import { DEMO_SLUG, enterDemo } from "./helpers/demo";

/**
 * Demo walkthrough smoke — portfolio script + module surfaces.
 * Requires DEMO_MODE=true and seeded DB (see global-setup).
 */
test.describe("demo walkthrough", () => {
  test.skip(
    process.env.DEMO_MODE !== "true",
    "Set DEMO_MODE=true and run pnpm db:seed:demo",
  );

  test("walkthrough hub loads with portfolio steps", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/walkthrough?step=0`);
    await expect(page.getByRole("heading", { name: /Executive dashboard/i })).toBeVisible();
    await expect(page.getByText(/Portfolio stop/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Next step/i })).toBeVisible();
    await expect(page.getByText(/What to show/i)).toBeVisible();
  });

  test("members CEO filter opens profile", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/members`);
    await expect(page.getByRole("heading", { name: "Members", exact: true })).toBeVisible();

    await page.goto(`/${DEMO_SLUG}/members?rolePreset=ceo&roleMode=include`);
    await expect(page.getByRole("status")).toContainText(/CEO/i);

    await page.getByRole("link", { name: /Khan, Avery/i }).click();
    await expect(page).toHaveURL(new RegExp(`\\/${DEMO_SLUG}\\/members\\/[^/]+$`));
    await expect(page.getByRole("heading", { name: "Avery Khan" }).first()).toBeVisible();
  });

  test("calendar store directory and insights load", async ({ page }) => {
    await enterDemo(page);

    await page.goto(`/${DEMO_SLUG}/calendar`);
    await expect(page.getByRole("heading", { name: /Event calendar/i })).toBeVisible();

    await page.goto(`/${DEMO_SLUG}/store`);
    await expect(page.getByRole("heading", { name: /Member store/i })).toBeVisible();

    await page.goto(`/${DEMO_SLUG}/directory`);
    await expect(page.getByText(/Member directory/i)).toBeVisible();

    await page.goto(`/${DEMO_SLUG}/insights`);
    await expect(page.getByRole("heading", { name: "Insights", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Custom dashboard/i })).toBeVisible();
  });
});
