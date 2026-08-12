import { expect, test } from '@playwright/test';

test('serves product category and detail routes as BaseLayout placeholders', async ({ page }) => {
  await page.goto('/two-way-radio/');
  await expect(page.locator('.foundation-placeholder')).toBeVisible();
  await expect(page.getByRole('heading', { name: '对讲机通信' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.shengborun.com/two-way-radio/',
  );
  await expect(page.locator('[data-category-switcher]')).toHaveCount(0);

  await page.goto('/two-way-radio/ly198/');
  await expect(page.locator('.foundation-placeholder')).toBeVisible();
  await expect(page.getByRole('heading', { name: '润信达 LY198' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.shengborun.com/two-way-radio/ly198/',
  );
  await expect(page.locator('[data-product-detail]')).toHaveCount(0);
});
