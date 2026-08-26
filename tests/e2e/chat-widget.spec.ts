import { expect, test } from '@playwright/test';

const visibleRoutes = [
  '/',
  '/products/',
  '/solutions/',
  '/support/',
  '/about/',
] as const;

for (const route of visibleRoutes) {
  test(`shows the AI support launcher on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(
      page.getByRole('button', { name: '打开 AI 客服' }),
    ).toBeVisible();
    await expect(page.locator('[data-chat-widget]')).toHaveCount(1);
  });
}

for (const route of ['/legal/', '/privacy/'] as const) {
  test(`does not render AI support on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-chat-widget]')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: '打开 AI 客服' }),
    ).toHaveCount(0);
  });
}
