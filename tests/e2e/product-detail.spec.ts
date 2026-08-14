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

  test('switches desktop parameter groups with pointer and keyboard input', async ({ page }) => {
    await page.goto('/shortwave-radio/envoy-x/');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    const tabs = page.locator('[data-parameter-tab]');
    await expect(tabs).toHaveCount(3);
    await expect(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-parameter-panel]:visible')).toHaveCount(1);
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-parameter-panel]:visible')).toContainText('电压范围');
    await tabs.nth(1).press('ArrowDown');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  });

  test('merges every parameter item into one mobile table', async ({ page }) => {
    await page.goto('/shortwave-radio/envoy-x/');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    for (const tab of await page.locator('[data-parameter-tab]').all()) {
      await expect(tab).toBeHidden();
    }
    const mobileTable = page.locator('[data-mobile-parameter-table]');
    await expect(mobileTable).toBeVisible();
    await expect(mobileTable).toContainText('信道和扫描组');
    await expect(mobileTable).toContainText('电压范围');
    await expect(mobileTable).toContainText('环境标准');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
