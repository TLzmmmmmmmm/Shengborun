import { expect, test, type Page } from '@playwright/test';
import type { ChatMessage } from '../../src/components/chat/chat-transport';

type ChatStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'done' }
  | {
      type: 'error';
      code: string;
      message: string;
      request_id: string;
    };

const encodeStream = (events: ChatStreamEvent[]) =>
  `${events.map((event) => JSON.stringify(event)).join('\n')}\n`;

const mockChatStream = async (
  page: Page,
  events: ChatStreamEvent[],
) => {
  await page.route('**/api/chat-stream', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: encodeStream(events),
    });
  });
};

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

test('sends with Enter and renders loading followed by a streamed answer', async ({
  page,
}) => {
  let releaseResponse: () => void = () => {};
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.route('**/api/chat-stream', async (route) => {
    await responseGate;
    await route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: encodeStream([
        { type: 'delta', content: '企业版支持' },
        { type: 'delta', content: '多种通信解决方案。' },
        { type: 'done' },
      ]),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();

  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });
  await input.fill('  产品咨询  ');
  await input.press('Enter');

  await expect(page.locator('[data-chat-message="user"]')).toHaveText('产品咨询');
  await expect(page.getByText('正在回复...')).toBeVisible();
  await expect(send).toBeDisabled();
  releaseResponse();
  await expect(page.getByText('企业版支持多种通信解决方案。')).toBeVisible();
  await expect(page.getByText('正在回复...')).toBeHidden();
  await expect(send).toBeDisabled();
});

test('styles dynamically appended messages as left and right bubbles', async ({
  page,
}) => {
  await mockChatStream(page, [
    { type: 'delta', content: '气泡' },
    { type: 'delta', content: '样式正常' },
    { type: 'done' },
  ]);
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  await input.fill('气泡样式');
  await input.press('Enter');

  const userMessage = page.locator('[data-chat-message="user"]');
  const assistantMessage = page.locator('[data-chat-message="assistant"]').last();
  await expect(userMessage).toHaveCSS('align-self', 'flex-end');
  await expect(userMessage).toHaveCSS('background-color', 'rgb(229, 248, 247)');
  await expect(assistantMessage).toHaveText('气泡样式正常');
  await expect(assistantMessage).toHaveCSS('align-self', 'flex-start');
  await expect(assistantMessage).toHaveCSS('background-color', 'rgb(255, 255, 255)');
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
  let requestCount = 0;

  await page.route('**/api/chat-stream', async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: encodeStream([
        {
          type: 'error',
          code: 'connection_error',
          message: '服务暂时不可用，请稍后再试。',
          request_id: 'request-stream-error',
        },
      ]),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });

  await input.fill('测试流式错误');
  await input.press('Enter');
  await input.press('Enter');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(1);
  await expect(page.getByText('服务暂时不可用，请稍后再试。')).toBeVisible();
  await expect.poll(() => requestCount).toBe(1);
  await expect(input).toBeEnabled();
});

test('shows a structured HTTP error without exposing internal details', async ({
  page,
}) => {
  await page.route('**/api/chat-stream', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 'rate_limit',
          message: '请求过于频繁，请稍后再试。',
          request_id: 'request-rate-limit',
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  await input.fill('再咨询一次');
  await input.press('Enter');

  await expect(page.getByText('请求过于频繁，请稍后再试。')).toBeVisible();
  await expect(page.getByText('request-rate-limit')).toHaveCount(0);
});

test('rolls back API history when a turn fails before the first delta', async ({
  page,
}) => {
  const requestBodies: Array<{ messages: ChatMessage[] }> = [];

  await page.route('**/api/chat-stream', async (route) => {
    requestBodies.push(route.request().postDataJSON() as { messages: ChatMessage[] });

    const events: ChatStreamEvent[] = requestBodies.length === 1
      ? [
          {
            type: 'error',
            code: 'connection_error',
            message: '服务暂时不可用，请稍后再试。',
            request_id: 'request-before-delta',
          },
        ]
      : [
          { type: 'delta', content: '第二次请求成功。' },
          { type: 'done' },
        ];

    await route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: encodeStream(events),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });

  await input.fill('首轮失败');
  await input.press('Enter');
  await expect(page.getByText('服务暂时不可用，请稍后再试。')).toBeVisible();
  await expect(page.getByText('首轮失败', { exact: true })).toBeVisible();
  await expect(page.locator('[data-chat-message="assistant"]')).toHaveCount(1);

  await input.fill('第二轮重试');
  await input.press('Enter');
  await expect(page.getByText('第二次请求成功。')).toBeVisible();

  expect(requestBodies).toHaveLength(2);
  expect(requestBodies[1]).toEqual({
    messages: [
      { role: 'user', content: '第二轮重试' },
    ],
  });
});

test('rolls back partial assistant output and preserves only successful API history', async ({
  page,
}) => {
  const requestBodies: Array<{ messages: ChatMessage[] }> = [];

  await page.route('**/api/chat-stream', async (route) => {
    requestBodies.push(route.request().postDataJSON() as { messages: ChatMessage[] });

    const responses: ChatStreamEvent[][] = [
      [
        { type: 'delta', content: '已完成的 AI 回复。' },
        { type: 'done' },
      ],
      [
        { type: 'delta', content: '不完整回复' },
        {
          type: 'error',
          code: 'timeout',
          message: '响应超时，请重新尝试。',
          request_id: 'request-after-delta',
        },
      ],
      [
        { type: 'delta', content: '重试后的完整回复。' },
        { type: 'done' },
      ],
    ];

    await route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: encodeStream(responses[requestBodies.length - 1]),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });

  await input.fill('成功轮次');
  await input.press('Enter');
  await expect(page.getByText('已完成的 AI 回复。')).toBeVisible();

  await input.fill('会在中途失败');
  await input.press('Enter');
  await expect(page.getByText('响应超时，请重新尝试。')).toBeVisible();
  await expect(page.getByText('会在中途失败', { exact: true })).toBeVisible();
  await expect(page.getByText('不完整回复')).toHaveCount(0);

  await input.fill('失败后重试');
  await input.press('Enter');
  await expect(page.getByText('重试后的完整回复。')).toBeVisible();

  expect(requestBodies).toHaveLength(3);
  expect(requestBodies[2]).toEqual({
    messages: [
      { role: 'user', content: '成功轮次' },
      { role: 'assistant', content: '已完成的 AI 回复。' },
      { role: 'user', content: '失败后重试' },
    ],
  });
});

test('preserves submitted messages after close and scrolls new content into view', async ({
  page,
}) => {
  await mockChatStream(page, [
    { type: 'delta', content: '这条 AI 回复也会保留。' },
    { type: 'done' },
  ]);
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  await input.fill('保留这条消息');
  await input.press('Enter');
  await expect(page.getByText('这条 AI 回复也会保留。')).toBeVisible();

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
  await expect(page.getByText('这条 AI 回复也会保留。')).toBeVisible();
});

test('keeps the desktop panel fluid and inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();

  const bounds = await page.getByRole('dialog', { name: 'AI 客服' }).boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeGreaterThanOrEqual(380);
  expect(bounds!.width).toBeLessThanOrEqual(420);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
});

test('switches to a near-full-screen panel only below 47.999rem', async ({
  page,
}) => {
  await page.setViewportSize({ width: 767, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const mobileBounds = await page
    .getByRole('dialog', { name: 'AI 客服' })
    .boundingBox();
  expect(mobileBounds).not.toBeNull();
  expect(mobileBounds!.width).toBeGreaterThanOrEqual(735);
  expect(mobileBounds!.height).toBeGreaterThanOrEqual(665);

  await page.setViewportSize({ width: 768, height: 700 });
  const desktopBounds = await page
    .getByRole('dialog', { name: 'AI 客服' })
    .boundingBox();
  expect(desktopBounds).not.toBeNull();
  expect(desktopBounds!.width).toBeLessThanOrEqual(420);
});

test('locks the page and keeps mobile controls keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();

  const body = page.locator('body');
  const close = page.getByRole('button', { name: '关闭 AI 客服' });
  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });

  await expect(body).toHaveAttribute('data-chat-widget-open', '');
  await expect(body).toHaveCSS('overflow', 'hidden');
  await expect(input).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();

  for (const control of [close, send]) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    320,
  );
  await close.click();
  await expect(body).not.toHaveAttribute('data-chat-widget-open');
});
