import { test, expect } from "@playwright/test";

test("marketing home shows PulsePoint competitive layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Modern AMS Built for Healthcare Associations/i,
  );
  await expect(page.getByRole("heading", { name: /Core Platform Features/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^MemberCore$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Frequently Asked Questions/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a call/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Request a demo/i })).toBeVisible();
  await expect(page.getByText("Membership")).toBeVisible();
  await expect(page.getByText("Meetings & Events")).toBeVisible();
  await expect(page.getByText("Live").first()).toBeVisible();
});
