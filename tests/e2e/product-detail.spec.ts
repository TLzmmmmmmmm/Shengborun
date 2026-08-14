import { expect, test } from '@playwright/test';

test.describe('product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/two-way-radio/ly198/');
  });

  test('renders product overview with four library icons', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(page.locator('.foundation-placeholder')).toHaveCount(0);
    await expect(page.locator('[data-product-detail]')).toBeVisible();
    await expect(page.getByRole('heading', { name: '润信达 LY198', level: 1 })).toBeVisible();
    await expect(page.locator('[data-product-cover]')).toHaveAttribute(
      'src',
      '/images/products/two-way-radio/ly198/ly198.jpeg',
    );
    await expect(page.locator('[data-product-description]')).toContainText('模拟对讲机');
    await expect(page.locator('[data-detail-feature]')).toHaveCount(4);
    await expect(page.locator('[data-detail-feature] svg')).toHaveCount(4);
    await expect(page.locator('[data-product-gallery]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  });

  test('stacks the overview and uses a two-column feature grid on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const imageBox = await page.locator('[data-product-media]').boundingBox();
    const infoBox = await page.locator('[data-product-info]').boundingBox();
    expect(imageBox!.y).toBeLessThan(infoBox!.y);
    const xs = await page.locator('[data-detail-feature]').evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().x)),
    );
    expect(new Set(xs).size).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
