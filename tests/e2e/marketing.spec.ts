import { test, expect } from "@playwright/test";

test("marketing home shows PulseCore", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Member CRM and events/i,
  );
  await expect(page.getByText("PulseCore")).toBeVisible();
});
