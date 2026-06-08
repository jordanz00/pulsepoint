import { test, expect } from "@playwright/test";
import { enterDemo, openLaunchedTakeActionForm } from "./helpers/demo";

/**
 * Advocacy take-action — demo launched campaign + public form.
 */
test.describe("advocacy take-action", () => {
  test.skip(
    process.env.DEMO_MODE !== "true",
    "Set DEMO_MODE=true and run pnpm db:seed:demo",
  );

  test("public form loads for launched demo campaign", async ({ page }) => {
    await enterDemo(page);
    await openLaunchedTakeActionForm(page);

    await expect(
      page.getByRole("heading", { name: /Spring grassroots hospital sign-on/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/Your name/i)).toBeVisible();
  });

  test("submits public take-action response (demo)", async ({ page }) => {
    await enterDemo(page);
    await openLaunchedTakeActionForm(page);

    await expect(
      page.getByRole("heading", { name: /Spring grassroots hospital sign-on/i }),
    ).toBeVisible({ timeout: 10_000 });

    const unique = `e2e-${Date.now()}@example.com`;
    await page.getByLabel(/Your name/i).fill("E2E Hospital Executive");
    await page.getByLabel(/Work email/i).fill(unique);
    await page.getByLabel(/Hospital name/i).fill("E2E Community Hospital");
    await page.getByRole("button", { name: /Submit response/i }).click();

    await expect(
      page.getByText(/Thank you.*recorded/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
