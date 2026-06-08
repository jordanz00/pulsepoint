import { test, expect } from "@playwright/test";

test("marketing home shows value proposition and Why PulsePoint", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /See your association clearly/i,
  );

  await expect(page.locator("#why-pulsepoint")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /What makes it different/i }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: /Why PulsePoint/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a call/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Request a demo|Open interactive demo/i }),
  ).toBeVisible();
  await expect(page.locator("code")).toHaveCount(0);
});

test("Why PulsePoint anchor scrolls into view", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Why PulsePoint/i }).first().click();
  await expect(page.locator("#why-pulsepoint")).toBeInViewport();
});
