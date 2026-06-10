import { test, expect } from "@playwright/test";

test("marketing home shows value proposition and Why PulsePoint", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PulsePoint");
  await expect(page.getByText(/Membership, advocacy, PAC/i)).toBeVisible();

  await expect(page.locator("#why-pulsepoint")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /What makes it different/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/One spine\. Zero spreadsheet archaeology/i)).toBeVisible();

  await expect(page.getByRole("link", { name: /Why PulsePoint/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a call/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Request a demo|Open interactive demo/i }).first(),
  ).toBeVisible();
  await expect(page.locator("code")).toHaveCount(0);
});

test("Flagship 5 section loads with honest labels", async ({ page }) => {
  await page.goto("/#flagship-features");
  await expect(
    page.getByRole("heading", { name: /Five reasons hospital associations switch/i }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: /Live.*Executive Command Center/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /See in demo/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open full flagship hub in demo/i })).toBeVisible();
});

test("Why PulsePoint anchor scrolls into view", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Why PulsePoint/i }).first().click();
  await expect(page.locator("#why-pulsepoint")).toBeInViewport();
});

test("Why PulsePoint shows chapter pills after headline", async ({ page }) => {
  await page.goto("/#why-pulsepoint");
  await expect(page.getByRole("navigation", { name: /Why PulsePoint chapters/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /01.*Compare/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /02.*Product/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /03.*Demo/i })).toBeVisible();
});

test("compare-protech loads without demo cookie", async ({ page }) => {
  await page.goto("/compare-protech");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter demo/i })).toBeVisible();
});
