import { test, expect } from "@playwright/test";
import { enterDemo, DEMO_SLUG } from "./helpers/demo";

/**
 * Wedge smoke — demo enter → overview → members → events → exceptions
 * Requires DEMO_MODE=true and pnpm db:seed:demo
 */
test.describe("demo wedge", () => {
  test.skip(
    process.env.DEMO_MODE !== "true",
    "Set DEMO_MODE=true and run pnpm db:seed:demo",
  );

  test("enter demo reaches home with executive briefing", async ({ page }) => {
    await enterDemo(page);
    await expect(page.getByRole("heading", { name: /Sterling Healthcare/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Leadership briefing/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Command center/i }).first()).toBeVisible();
  });

  test("members directory loads", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/members`);
    await expect(page.getByRole("heading", { name: "Members", exact: true })).toBeVisible();
    await expect(page.locator(".member-directory-row").first()).toBeVisible();
  });

  test("member detail summary one-screen", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/members`);
    await page.locator(".member-directory-row").first().click();
    await expect(page.getByRole("tab", { name: /Summary/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Event registrations/i })).toBeVisible();
  });

  test("events list and new event CTA", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/events`);
    await expect(page.getByRole("heading", { name: /Events/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /New event/i }).first()).toBeVisible();
  });

  test("exceptions queue shows seeded items", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/exceptions`);
    await expect(
      page.getByRole("heading", { level: 1, name: /Exceptions queue/i }),
    ).toBeVisible();
    await expect(page.getByText(/registration\.confirm_email/i)).toBeVisible();
  });
});

test.describe("demo wedge mobile", () => {
  test.skip(
    process.env.DEMO_MODE !== "true",
    "Set DEMO_MODE=true and run pnpm db:seed:demo",
  );

  test.use({ viewport: { width: 390, height: 844 } });

  test("members directory usable on phone", async ({ page }) => {
    await enterDemo(page);
    await page.goto(`/${DEMO_SLUG}/members`);
    const row = page.locator(".member-directory-row").first();
    await expect(row).toBeVisible();
    const box = await row.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
