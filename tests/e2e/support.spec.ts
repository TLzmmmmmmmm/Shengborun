import { expect, test } from '@playwright/test';

const pages = [
  ['/support/', '技术支持'],
  ['/support/network-planning/', '网络规划服务'],
  ['/support/system-engineering/', '系统工程建设服务'],
  ['/support/maintenance-support/', '维护保障服务'],
  ['/support/equipment-inspection/', '设备巡检服务'],
  ['/support/communication-support/', '通讯保障服务'],
  ['/support/technical-training/', '技术培训服务'],
] as const;

for (const [path, title] of pages) {
  test(`${path} is a BaseLayout placeholder`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.foundation-placeholder')).toBeVisible();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://www.shengborun.com${path}`,
    );
    await expect(page.locator('[data-service-card]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('常见问题');
    await expect(page.locator('main')).not.toContainText('使用说明');
    await expect(page.locator('main')).not.toContainText('售后服务');
  });
}
