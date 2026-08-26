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
  const messages = page.locator('[data-chat-message]');
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await launcher.click();
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
});

test('sends with Enter and renders loading followed by the local answer', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();

  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });
  await input.fill('  产品咨询  ');
  await input.press('Enter');

  await expect(page.locator('[data-chat-message="user"]')).toHaveText('产品咨询');
  await expect(page.getByText('AI 正在回复...')).toBeVisible();
  await expect(send).toBeDisabled();
  await expect(
    page.getByText('前端开发演示回复：已收到“产品咨询”。'),
  ).toBeVisible();
  await expect(page.getByText('AI 正在回复...')).toBeHidden();
  await expect(send).toBeDisabled();
});

test('uses Shift+Enter for a newline and rejects whitespace-only input', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });

  await input.fill('第一行');
  await input.press('Shift+Enter');
  await input.pressSequentially('第二行');
  await expect(input).toHaveValue('第一行\n第二行');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(0);

  await input.fill('   ');
  await expect(send).toBeDisabled();
  await input.press('Enter');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(0);
});

test('prevents duplicate submission and shows a safe controlled error', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });

  await input.fill('__mock_error__');
  await input.press('Enter');
  await input.press('Enter');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(1);
  await expect(
    page.getByText(
      '当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。',
    ),
  ).toBeVisible();
  await expect(input).toBeEnabled();
});

test('preserves submitted messages after close and scrolls new content into view', async ({
  page,
}) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  await input.fill('保留这条消息');
  await input.press('Enter');
  await expect(
    page.getByText('前端开发演示回复：已收到“保留这条消息”。'),
  ).toBeVisible();

  const list = page.locator('[data-chat-messages]');
  await expect
    .poll(() =>
      list.evaluate((element) =>
        Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop),
      ),
    )
    .toBeLessThanOrEqual(2);

  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await launcher.click();
  await expect(page.getByText('保留这条消息', { exact: true })).toBeVisible();
});
