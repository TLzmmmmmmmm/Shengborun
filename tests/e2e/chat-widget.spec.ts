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

test('opens, closes, and restores focus with keyboard support', async ({
  page,
}) => {
  await page.goto('/');

  const launcher = page.locator('[data-chat-launcher]');
  const dialog = page.getByRole('dialog', { name: 'AI 客服' });
  const input = page.getByRole('textbox', { name: '输入问题' });

  await launcher.click();
  await expect(dialog).toBeVisible();
  await expect(launcher).toHaveAttribute('aria-expanded', 'true');
  await expect(launcher).toHaveAccessibleName('AI 客服已打开');
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(launcher).toHaveAttribute('aria-expanded', 'false');
  await expect(launcher).toBeFocused();

  await launcher.click();
  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('keeps the current message DOM across close and reopen', async ({
  page,
}) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();
  const messages = page.locator('[data-chat-messages] > li');
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await launcher.click();
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
});
