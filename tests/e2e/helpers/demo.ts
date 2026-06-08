import { expect, type Page } from "@playwright/test";

export const DEMO_SLUG = "demo-healthcare";

/** Enter demo via overview-only path (fastest smoke). */
export async function enterDemo(page: Page) {
  await page.goto("/demo");
  const enterOverview = page.getByRole("button", { name: /overview only/i });
  await expect(enterOverview).toBeVisible();
  await enterOverview.click();
  await expect(page).toHaveURL(new RegExp(`\\/${DEMO_SLUG}\\/?$`));
}

/** Open launched campaign public form (link uses target=_blank in admin UI). */
export async function openLaunchedTakeActionForm(page: Page) {
  await page.goto(`/${DEMO_SLUG}/enterprise/advocacy`);
  await expect(page.getByRole("heading", { name: /Advocacy/i })).toBeVisible();
  const publicFormLink = page.getByRole("link", { name: /Public form/i }).first();
  await expect(publicFormLink).toBeVisible();
  const href = await publicFormLink.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
}
