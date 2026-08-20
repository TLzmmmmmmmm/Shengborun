import { expect, test } from '@playwright/test';

test('privacy policy is published as a simple hierarchical document', async ({ page }) => {
  const response = await page.goto('/privacy/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    '隐私政策 - 北京盛博润通信设备有限公司',
  );
  await expect(page.getByRole('heading', { level: 1, name: '隐私政策' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '页面目录' })).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 2, name: '1. 我们处理的信息' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: '1.1 您主动联系时提供的信息' }),
  ).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'IP 地址；' })).toBeVisible();
});

test('legal statement is published as a simple hierarchical document', async ({ page }) => {
  const response = await page.goto('/legal/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    '法律声明 - 北京盛博润通信设备有限公司',
  );
  await expect(page.getByRole('heading', { level: 1, name: '法律声明' })).toBeVisible();
  await expect(page.getByText('生效日期：2026年8月20日', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '页面目录' })).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 2, name: '1. 适用范围与声明更新' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: '4.2 网站及网络安全' }),
  ).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: '非法访问本网站服务器' }),
  ).toBeVisible();
});

test('privacy page publishes the provided privacy-request channel', async ({ page }) => {
  await page.goto('/privacy/');

  await expect(page.getByText('13911733859', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'lsk777@sina.com' })).toHaveAttribute(
    'href',
    'mailto:lsk777@sina.com',
  );
});
