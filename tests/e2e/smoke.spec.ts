import { expect, test } from '@playwright/test';

test('serves the initial Shengborun homepage', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('盛博润');
  await expect(page.getByRole('heading', { level: 1, name: '盛博润' })).toBeVisible();
});
