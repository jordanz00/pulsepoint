import { expect, type Page } from "@playwright/test";

export const DEMO_SLUG = "demo-healthcare";

const SPRING_CAMPAIGN_NAME = "Spring grassroots hospital sign-on";

/** Enter demo via overview-only path (fastest smoke). */
export async function enterDemo(page: Page) {
  await page.goto("/demo");
  const enterOverview = page.getByRole("button", { name: /overview only/i });
  await expect(enterOverview).toBeVisible();
  await enterOverview.click();
  await expect(page).toHaveURL(new RegExp(`\\/${DEMO_SLUG}\\/?$`));
}

/** Open launched campaign public form via advocacy quick actions. */
export async function openLaunchedTakeActionForm(page: Page) {
  await page.goto(`/${DEMO_SLUG}/enterprise/advocacy`);
  await expect(
    page.getByRole("heading", { name: /Advocacy & government affairs/i }),
  ).toBeVisible({ timeout: 15_000 });

  const campaignRow = page
    .locator(".pp-advocacy-launch-row")
    .filter({ hasText: SPRING_CAMPAIGN_NAME });
  await expect(campaignRow).toBeVisible({ timeout: 15_000 });

  const previewLink = campaignRow.getByRole("link", { name: /Preview form/i });
  await expect(previewLink).toBeVisible();
  const href = await previewLink.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
}
