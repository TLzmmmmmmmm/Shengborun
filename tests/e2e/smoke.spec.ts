import { expect, test } from '@playwright/test';

test('serves the initial Shengborun homepage', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('北京盛博润通讯设备有限公司');
  await expect(page.getByRole('heading', { level: 1, name: '盛博润' })).toBeVisible();
});

test('serves the company mark favicon', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/favicon.ico',
  );

  const response = await request.get('/favicon.ico');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/');
  expect((await response.body()).byteLength).toBeGreaterThan(0);
});
