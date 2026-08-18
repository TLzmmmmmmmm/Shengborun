import { expect, test } from '@playwright/test';

for (const policy of [
  {
    path: '/privacy/',
    title: '隐私政策',
    firstSection: '我们处理的信息',
  },
  {
    path: '/legal/',
    title: '法律声明',
    firstSection: '网站使用',
  },
]) {
  test(`${policy.title} is published as a navigable policy document`, async ({ page }) => {
    const response = await page.goto(policy.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(
      `${policy.title} - 北京盛博润通信设备有限公司`,
    );
    await expect(page.getByRole('heading', { level: 1, name: policy.title })).toBeVisible();
    await expect(page.getByRole('navigation', { name: '页面目录' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: policy.firstSection }),
    ).toBeVisible();
    await expect(page.getByText('页面将在后续阶段完成。')).toHaveCount(0);
  });
}

test('privacy page publishes a direct privacy-request channel', async ({ page }) => {
  await page.goto('/privacy/');

  await expect(page.getByRole('link', { name: '13911733859' })).toHaveAttribute(
    'href',
    'tel:+8613911733859',
  );
  await expect(page.getByRole('link', { name: 'lsk777@sina.com' })).toHaveAttribute(
    'href',
    'mailto:lsk777@sina.com',
  );
});
