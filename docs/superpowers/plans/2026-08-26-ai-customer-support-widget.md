# AI Customer Support Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and test a site-wide Shengborun AI customer-support widget that uses a local development mock, floats on desktop, becomes near-full-screen below `47.999rem`, and stays absent from legal and privacy pages.

**Architecture:** `BaseLayout.astro` owns site-wide placement and exposes a default-on `showChatWidget` prop; legal and privacy layouts opt out. `ChatWidget.astro` owns UI state, DOM rendering, responsive behavior, focus, and scrolling, while `chat-transport.ts` provides a replaceable development-only async boundary with the future `{ answer: string }` response shape and no network access.

**Tech Stack:** Astro 6, browser TypeScript, scoped CSS, `@lucide/astro`, Vitest 4, Playwright 1.62, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-08-25-ai-customer-support-widget-design.md`

## Global Constraints

- Work only on branch `AI-Assistant-Develop`.
- Do not add `fetch`, XMLHttpRequest, FastAPI calls, Nginx rules, DeepSeek calls, API keys, environment secrets, React, Vue, or another client framework.
- Render the widget on home, product, category, solution, support, and about pages.
- Do not render widget markup or browser behavior on legal or privacy pages.
- Use the existing mobile breakpoint exactly: `@media (max-width: 47.999rem)`.
- Initial assistant copy is exactly `您好，请问有什么可以帮助您？` and is local-only.
- Error copy is exactly `当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。`.
- `Enter` sends; `Shift + Enter` inserts a newline; whitespace-only input never sends.
- Disable send and prevent duplicate submission while loading.
- Preserve messages across close/reopen only for the current loaded page.
- Use existing Shengborun tokens, system typography, focus treatment, and Lucide icons.
- Keep pointer targets approximately 44px or larger and never introduce page-level horizontal overflow.
- Follow TDD for every task: failing test, verified failure, minimal implementation, verified pass, commit.

## File Map

- Create `src/components/chat/chat-transport.ts`: development-only `ChatTransport` contract, mock success response, controlled failure, and delay.
- Create `src/components/chat/ChatWidget.astro`: semantic UI, state, interactions, rendering, responsive CSS, focus, scroll, and body locking.
- Modify `src/layouts/BaseLayout.astro`: default-on `showChatWidget` prop and one global widget mount.
- Modify `src/layouts/LegalLayout.astro`: pass `showChatWidget={false}`.
- Modify `src/layouts/PrivacyLayout.astro`: pass `showChatWidget={false}`.
- Create `tests/unit/chat-transport.test.ts`: transport shape, controlled failure, and no-network/security boundary.
- Create `tests/e2e/chat-widget.spec.ts`: visibility, interaction, state, responsiveness, scrolling, and accessibility behavior.

---

### Task 1: Development-Only Mock Transport

**Files:**
- Create: `src/components/chat/chat-transport.ts`
- Create: `tests/unit/chat-transport.test.ts`

**Interfaces:**
- Consumes: no project feature code.
- Produces: `ChatAnswer`, `ChatTransport`, `MOCK_FAILURE_INPUT`, and `requestMockChatAnswer(message, delayMs?)` for `ChatWidget.astro`.

- [ ] **Step 1: Write the failing transport tests**

Create `tests/unit/chat-transport.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  MOCK_FAILURE_INPUT,
  requestMockChatAnswer,
} from '../../src/components/chat/chat-transport';

describe('development chat transport', () => {
  it('returns the future API response shape without calling the network', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(requestMockChatAnswer('产品咨询', 0)).resolves.toEqual({
      answer: '前端开发演示回复：已收到“产品咨询”。',
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('exposes a controlled development-only failure', async () => {
    await expect(requestMockChatAnswer(MOCK_FAILURE_INPUT, 0)).rejects.toThrow(
      'Development mock failure',
    );
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
pnpm exec vitest run tests/unit/chat-transport.test.ts
```

Expected: FAIL because `src/components/chat/chat-transport.ts` does not exist.

- [ ] **Step 3: Implement the minimal mock contract**

Create `src/components/chat/chat-transport.ts`:

```ts
export interface ChatAnswer {
  answer: string;
}

export type ChatTransport = (message: string) => Promise<ChatAnswer>;

export const MOCK_FAILURE_INPUT = '__mock_error__';
export const MOCK_RESPONSE_DELAY_MS = 700;

/** Development-only local transport. Replace with /api/chat in a later phase. */
export const requestMockChatAnswer = async (
  message: string,
  delayMs = MOCK_RESPONSE_DELAY_MS,
): Promise<ChatAnswer> => {
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

  if (message === MOCK_FAILURE_INPUT) {
    throw new Error('Development mock failure');
  }

  return {
    answer: `前端开发演示回复：已收到“${message}”。`,
  };
};
```

- [ ] **Step 4: Run the focused test and all unit tests**

Run:

```powershell
pnpm exec vitest run tests/unit/chat-transport.test.ts
pnpm run test:unit
```

Expected: both commands PASS; the fetch spy has zero calls.

- [ ] **Step 5: Commit the transport boundary**

```powershell
git add src/components/chat/chat-transport.ts tests/unit/chat-transport.test.ts
git commit -m "test: define local chat transport"
```

---

### Task 2: Site-Wide Mount With Legal and Privacy Opt-Out

**Files:**
- Create: `src/components/chat/ChatWidget.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/LegalLayout.astro`
- Modify: `src/layouts/PrivacyLayout.astro`
- Create: `tests/e2e/chat-widget.spec.ts`

**Interfaces:**
- Consumes: existing `BaseLayout` props and layout composition.
- Produces: `showChatWidget?: boolean`, `[data-chat-widget]`, launcher accessible name `打开 AI 客服`, and panel title `AI 客服`.

- [ ] **Step 1: Write failing page-visibility tests**

Create `tests/e2e/chat-widget.spec.ts`:

```ts
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
    await expect(page.getByRole('button', { name: '打开 AI 客服' })).toBeVisible();
    await expect(page.locator('[data-chat-widget]')).toHaveCount(1);
  });
}

for (const route of ['/legal/', '/privacy/'] as const) {
  test(`does not render AI support on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-chat-widget]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '打开 AI 客服' })).toHaveCount(0);
  });
}
```

- [ ] **Step 2: Build and verify the visibility tests fail**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts
```

Expected: build passes, then Playwright FAILS because the launcher is absent on business routes.

- [ ] **Step 3: Add the minimal semantic component**

Create `src/components/chat/ChatWidget.astro`:

```astro
---
import { Bot, MessageCircle, Send, X } from '@lucide/astro';
---

<section class="chat-widget" data-chat-widget>
  <button
    class="chat-launcher"
    type="button"
    aria-label="打开 AI 客服"
    aria-controls="ai-customer-support-panel"
    aria-expanded="false"
    data-chat-launcher
  >
    <MessageCircle aria-hidden="true" />
  </button>

  <div
    id="ai-customer-support-panel"
    class="chat-panel"
    role="dialog"
    aria-labelledby="ai-customer-support-title"
    data-chat-panel
    hidden
  >
    <header class="chat-header">
      <span class="chat-identity" aria-hidden="true"><Bot /></span>
      <h2 id="ai-customer-support-title">AI 客服</h2>
      <button type="button" aria-label="关闭 AI 客服" data-chat-close><X aria-hidden="true" /></button>
    </header>

    <ol class="chat-messages" aria-label="对话消息" data-chat-messages>
      <li class="chat-message chat-message--assistant">您好，请问有什么可以帮助您？</li>
    </ol>

    <form class="chat-composer" data-chat-form>
      <label class="visually-hidden" for="ai-customer-support-input">输入问题</label>
      <textarea id="ai-customer-support-input" rows="1" placeholder="输入您的问题..." data-chat-input></textarea>
      <button type="submit" aria-label="发送问题" data-chat-send disabled><Send aria-hidden="true" /></button>
    </form>
  </div>
</section>
```

Add only enough scoped CSS for the launcher to be fixed, visible, and at least 44px; full visual CSS belongs to Task 5.

- [ ] **Step 4: Mount once and add explicit opt-outs**

In `src/layouts/BaseLayout.astro`:

```astro
import ChatWidget from '../components/chat/ChatWidget.astro';

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  showChatWidget?: boolean;
}

const {
  title,
  description,
  canonicalPath,
  image,
  breadcrumbs = [],
  showChatWidget = true,
} = Astro.props;
```

Render after the footer and before `</body>`:

```astro
<Footer breadcrumbs={footerBreadcrumbs} />
{showChatWidget && <ChatWidget />}
```

In both `LegalLayout.astro` and `PrivacyLayout.astro`, add the prop to the existing `<BaseLayout>` opening tag:

```astro
showChatWidget={false}
```

- [ ] **Step 5: Build and verify page visibility**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts
```

Expected: all visibility tests PASS; legal/privacy contain no widget root.

- [ ] **Step 6: Commit global placement**

```powershell
git add src/components/chat/ChatWidget.astro src/layouts/BaseLayout.astro src/layouts/LegalLayout.astro src/layouts/PrivacyLayout.astro tests/e2e/chat-widget.spec.ts
git commit -m "feat: mount AI support widget site-wide"
```

---

### Task 3: Open, Close, Escape, and Focus Lifecycle

**Files:**
- Modify: `src/components/chat/ChatWidget.astro`
- Modify: `tests/e2e/chat-widget.spec.ts`

**Interfaces:**
- Consumes: `[data-chat-launcher]`, `[data-chat-panel]`, `[data-chat-close]`, `[data-chat-input]` from Task 2.
- Produces: launcher `aria-expanded` synchronization, input focus on open, launcher focus on close, and state-preserving hide/show.

- [ ] **Step 1: Add failing lifecycle tests**

Append to `tests/e2e/chat-widget.spec.ts`:

```ts
test('opens, closes, and restores focus with keyboard support', async ({ page }) => {
  await page.goto('/');

  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  const dialog = page.getByRole('dialog', { name: 'AI 客服' });
  const input = page.getByRole('textbox', { name: '输入问题' });

  await launcher.click();
  await expect(dialog).toBeVisible();
  await expect(launcher).toHaveAttribute('aria-expanded', 'true');
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

test('keeps the current message DOM across close and reopen', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();
  const messages = page.locator('[data-chat-messages] > li');
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await launcher.click();
  await expect(messages).toHaveText(['您好，请问有什么可以帮助您？']);
});
```

- [ ] **Step 2: Build and verify lifecycle RED**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts --grep "opens|keeps the current"
```

Expected: FAIL because the component has no lifecycle script.

- [ ] **Step 3: Implement the lifecycle script**

Add a processed `<script>` to `ChatWidget.astro`:

```ts
const root = document.querySelector<HTMLElement>('[data-chat-widget]');
const launcher = root?.querySelector<HTMLButtonElement>('[data-chat-launcher]');
const panel = root?.querySelector<HTMLElement>('[data-chat-panel]');
const closeButton = root?.querySelector<HTMLButtonElement>('[data-chat-close]');
const input = root?.querySelector<HTMLTextAreaElement>('[data-chat-input]');

let isOpen = false;

const setOpen = (open: boolean) => {
  if (!launcher || !panel) return;
  isOpen = open;
  launcher.setAttribute('aria-expanded', String(open));
  launcher.setAttribute('aria-label', open ? 'AI 客服已打开' : '打开 AI 客服');
  panel.hidden = !open;

  if (open) {
    input?.focus();
  } else {
    launcher.focus();
  }
};

launcher?.addEventListener('click', () => setOpen(true));
closeButton?.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isOpen) setOpen(false);
});
```

Do not re-create or clear the message list in `setOpen`; hiding the panel preserves state.

- [ ] **Step 4: Verify lifecycle GREEN**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts --grep "opens|keeps the current"
```

Expected: PASS.

- [ ] **Step 5: Commit lifecycle behavior**

```powershell
git add src/components/chat/ChatWidget.astro tests/e2e/chat-widget.spec.ts
git commit -m "feat: add chat widget lifecycle"
```

---

### Task 4: Message Submission and Async UI States

**Files:**
- Modify: `src/components/chat/ChatWidget.astro`
- Modify: `tests/e2e/chat-widget.spec.ts`

**Interfaces:**
- Consumes: `requestMockChatAnswer`, `MOCK_FAILURE_INPUT`, form/input/message DOM, and lifecycle state.
- Produces: `Message`, local `messages`, `isLoading`, `error`, trimmed submission, local success/error rendering, and auto-scroll.

- [ ] **Step 1: Add failing success and keyboard tests**

Append:

```ts
test('sends with Enter and renders loading followed by the local answer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();

  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });
  await input.fill('  产品咨询  ');
  await input.press('Enter');

  await expect(page.locator('[data-chat-message="user"]')).toHaveText('产品咨询');
  await expect(page.getByText('AI 正在回复...')).toBeVisible();
  await expect(send).toBeDisabled();
  await expect(page.getByText('前端开发演示回复：已收到“产品咨询”。')).toBeVisible();
  await expect(page.getByText('AI 正在回复...')).toBeHidden();
  await expect(send).toBeDisabled();
});

test('uses Shift+Enter for a newline and rejects whitespace-only input', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  const send = page.getByRole('button', { name: '发送问题' });

  await input.fill('第一行');
  await input.press('Shift+Enter');
  await input.type('第二行');
  await expect(input).toHaveValue('第一行\n第二行');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(0);

  await input.fill('   ');
  await expect(send).toBeDisabled();
  await input.press('Enter');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(0);
});
```

- [ ] **Step 2: Add failing error, duplicate, preservation, and scroll tests**

Append:

```ts
test('prevents duplicate submission and shows a safe controlled error', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const input = page.getByRole('textbox', { name: '输入问题' });

  await input.fill('__mock_error__');
  await input.press('Enter');
  await input.press('Enter');
  await expect(page.locator('[data-chat-message="user"]')).toHaveCount(1);
  await expect(page.getByText('当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。')).toBeVisible();
  await expect(input).toBeEnabled();
});

test('preserves submitted messages after close and scrolls new content into view', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();
  const input = page.getByRole('textbox', { name: '输入问题' });
  await input.fill('保留这条消息');
  await input.press('Enter');
  await expect(page.getByText('前端开发演示回复：已收到“保留这条消息”。')).toBeVisible();

  const list = page.locator('[data-chat-messages]');
  await expect.poll(() => list.evaluate((element) =>
    Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop),
  )).toBeLessThanOrEqual(2);

  await page.getByRole('button', { name: '关闭 AI 客服' }).click();
  await launcher.click();
  await expect(page.getByText('保留这条消息', { exact: true })).toBeVisible();
});
```

- [ ] **Step 3: Build and verify async-state RED**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts --grep "sends|Shift|duplicate|preserves submitted"
```

Expected: FAIL because submission and rendering are not implemented.

- [ ] **Step 4: Add loading and error nodes to the message list**

Inside the existing `<ol>` after the greeting:

```astro
<li class="chat-status" data-chat-loading hidden>AI 正在回复...</li>
<li class="chat-error" role="status" data-chat-error hidden>
  当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。
</li>
```

Add `aria-live="polite"` and `aria-relevant="additions text"` to the message list.

- [ ] **Step 5: Implement message state and safe DOM rendering**

Import the mock inside the processed script and add:

```ts
import { requestMockChatAnswer } from './chat-transport';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const form = root?.querySelector<HTMLFormElement>('[data-chat-form]');
const sendButton = root?.querySelector<HTMLButtonElement>('[data-chat-send]');
const messageList = root?.querySelector<HTMLOListElement>('[data-chat-messages]');
const loadingNode = root?.querySelector<HTMLElement>('[data-chat-loading]');
const errorNode = root?.querySelector<HTMLElement>('[data-chat-error]');

const messages: Message[] = [
  { role: 'assistant', content: '您好，请问有什么可以帮助您？' },
];
let isLoading = false;
let error: string | null = null;
let inputValue = '';

const syncComposer = () => {
  if (!sendButton) return;
  sendButton.disabled = isLoading || inputValue.trim().length === 0;
};

const scrollMessagesToEnd = () => {
  requestAnimationFrame(() => {
    messageList?.scrollTo({ top: messageList.scrollHeight });
  });
};

const appendMessage = (message: Message) => {
  if (!messageList || !loadingNode || !errorNode) return;
  messages.push(message);
  const item = document.createElement('li');
  item.className = `chat-message chat-message--${message.role}`;
  item.dataset.chatMessage = message.role;
  item.textContent = message.content;
  messageList.insertBefore(item, loadingNode);
  scrollMessagesToEnd();
};

const setLoading = (loading: boolean) => {
  isLoading = loading;
  if (loadingNode) loadingNode.hidden = !loading;
  syncComposer();
  scrollMessagesToEnd();
};

const setError = (message: string | null) => {
  error = message;
  if (!errorNode) return;
  errorNode.hidden = message === null;
  scrollMessagesToEnd();
};
```

Use `textContent`, never `innerHTML`, for message content.

- [ ] **Step 6: Implement submission and keyboard behavior**

```ts
const submitMessage = async () => {
  if (!input || isLoading) return;
  const message = input.value.trim();
  if (!message) return;

  appendMessage({ role: 'user', content: message });
  input.value = '';
  inputValue = '';
  setError(null);
  setLoading(true);

  try {
    const response = await requestMockChatAnswer(message);
    appendMessage({ role: 'assistant', content: response.answer });
  } catch {
    setError('当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。');
  } finally {
    setLoading(false);
    input.focus();
  }
};

input?.addEventListener('input', () => {
  inputValue = input.value;
  syncComposer();
});

input?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    void submitMessage();
  }
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  void submitMessage();
});

syncComposer();
```

- [ ] **Step 7: Build and verify all chat behavior GREEN**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts
```

Expected: all chat-widget tests PASS.

- [ ] **Step 8: Commit message behavior**

```powershell
git add src/components/chat/ChatWidget.astro tests/e2e/chat-widget.spec.ts
git commit -m "feat: add local chat interactions"
```

---

### Task 5: Responsive Visual System, Mobile Isolation, and Accessibility

**Files:**
- Modify: `src/components/chat/ChatWidget.astro`
- Modify: `tests/e2e/chat-widget.spec.ts`

**Interfaces:**
- Consumes: the complete widget DOM and state behavior from Tasks 2–4, existing CSS tokens, and the site breakpoint.
- Produces: constrained desktop geometry, mobile near-full-screen layout, body lock, approximately 44px controls, mobile focus containment, and no page overflow.

- [ ] **Step 1: Add failing desktop and breakpoint tests**

Append:

```ts
test('constrains the desktop panel and switches at the site breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开 AI 客服' }).click();
  const panel = page.getByRole('dialog', { name: 'AI 客服' });
  const desktopBox = (await panel.boundingBox())!;
  expect(desktopBox.width).toBeGreaterThanOrEqual(380);
  expect(desktopBox.width).toBeLessThanOrEqual(420);
  expect(desktopBox.x + desktopBox.width).toBeLessThanOrEqual(1440);
  expect(desktopBox.y + desktopBox.height).toBeLessThanOrEqual(900);

  await page.setViewportSize({ width: 767, height: 700 });
  const mobileBox = (await panel.boundingBox())!;
  expect(mobileBox.width).toBeGreaterThanOrEqual(735);
  expect(mobileBox.height).toBeGreaterThanOrEqual(660);

  await page.setViewportSize({ width: 768, height: 700 });
  const boundaryBox = (await panel.boundingBox())!;
  expect(boundaryBox.width).toBeLessThanOrEqual(420);
});
```

- [ ] **Step 2: Add failing mobile isolation and target-size tests**

Append:

```ts
test('locks the mobile page and keeps controls usable without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: '打开 AI 客服' });
  await launcher.click();

  await expect(page.locator('body')).toHaveAttribute('data-chat-widget-open', '');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  for (const control of [
    page.getByRole('button', { name: '关闭 AI 客服' }),
    page.getByRole('button', { name: '发送问题' }),
  ]) {
    const box = (await control.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  const input = page.getByRole('textbox', { name: '输入问题' });
  const close = page.getByRole('button', { name: '关闭 AI 客服' });
  await expect(input).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();

  await close.click();
  await expect(page.locator('body')).not.toHaveAttribute('data-chat-widget-open', '');
});
```

- [ ] **Step 3: Build and verify responsive RED**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts --grep "constrains|locks the mobile"
```

Expected: FAIL on geometry and/or body locking.

- [ ] **Step 4: Implement desktop and mobile CSS using existing tokens**

Complete the component's scoped styles with these concrete layout rules:

```css
.chat-widget { position: relative; z-index: 300; }
.chat-launcher {
  position: fixed;
  right: max(1.25rem, env(safe-area-inset-right));
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: var(--brand-teal-dark);
  color: var(--surface);
  box-shadow: 0 .75rem 2rem rgb(0 0 0 / 18%);
  cursor: pointer;
}
.chat-panel {
  position: fixed;
  right: max(1.25rem, env(safe-area-inset-right));
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  display: flex;
  width: min(25rem, calc(100vw - 2.5rem));
  height: min(38.75rem, calc(100dvh - 2.5rem));
  min-height: min(30rem, calc(100dvh - 2.5rem));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-medium);
  background: var(--surface);
  box-shadow: 0 1.25rem 3.5rem rgb(0 0 0 / 20%);
}
.chat-panel[hidden] { display: none; }
.chat-header { display: flex; min-height: 3.5rem; align-items: center; gap: .625rem; padding-inline: 1rem .375rem; background: var(--brand-teal-dark); color: var(--surface); }
.chat-header h2 { margin: 0; font-size: 1rem; }
.chat-header button, .chat-composer button { display: grid; min-width: 2.75rem; min-height: 2.75rem; place-items: center; border: 0; cursor: pointer; }
.chat-header button { margin-left: auto; background: transparent; color: inherit; }
.chat-messages { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 1rem; list-style: none; }
.chat-message { width: fit-content; max-width: 82%; margin-bottom: .75rem; padding: .625rem .75rem; border: 1px solid var(--divider); border-radius: var(--radius-small); white-space: pre-wrap; overflow-wrap: anywhere; }
.chat-message--assistant { background: var(--surface-muted); }
.chat-message--user { margin-left: auto; border-color: transparent; background: var(--brand-teal-soft); }
.chat-status, .chat-error { margin: .5rem 0; padding: .625rem .75rem; color: var(--text-secondary); }
.chat-error { border-left: .25rem solid #b42318; color: var(--text-primary); }
.chat-composer { display: flex; align-items: flex-end; gap: .5rem; padding: .75rem; border-top: 1px solid var(--divider); background: var(--surface); }
.chat-composer textarea { min-width: 0; min-height: 2.75rem; max-height: 8rem; flex: 1; resize: vertical; border: 1px solid var(--border); border-radius: var(--radius-small); padding: .6rem .75rem; }
.chat-composer button { border-radius: var(--radius-small); background: var(--brand-teal-dark); color: var(--surface); }
.chat-composer button:disabled { cursor: not-allowed; opacity: .5; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 47.999rem) {
  :global(body[data-chat-widget-open]) { overflow: hidden; }
  .chat-panel {
    top: max(.5rem, env(safe-area-inset-top));
    right: max(.5rem, env(safe-area-inset-right));
    bottom: max(.5rem, env(safe-area-inset-bottom));
    left: max(.5rem, env(safe-area-inset-left));
    width: auto;
    height: auto;
    min-height: 0;
  }
}
```

Keep all icon sizes restrained and reuse the global `:focus-visible` rule rather than suppressing outlines.

- [ ] **Step 5: Add body-lock cleanup and mobile focus containment**

Extend `setOpen` and keyboard handling:

```ts
const mobileMedia = window.matchMedia('(max-width: 47.999rem)');

const syncBodyLock = () => {
  document.body.toggleAttribute('data-chat-widget-open', isOpen && mobileMedia.matches);
};

const getFocusableControls = () =>
  panel
    ? [...panel.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled])')]
    : [];

// Call syncBodyLock() inside setOpen after assigning isOpen.
mobileMedia.addEventListener('change', syncBodyLock);
window.addEventListener('pagehide', () => document.body.removeAttribute('data-chat-widget-open'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isOpen) {
    setOpen(false);
    return;
  }
  if (event.key !== 'Tab' || !isOpen || !mobileMedia.matches) return;

  const controls = getFocusableControls();
  const first = controls[0];
  const last = controls.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
```

Merge this with the existing Escape listener so only one document keydown listener remains.

- [ ] **Step 6: Verify focused responsive tests GREEN**

Run:

```powershell
pnpm run build
pnpm exec playwright test tests/e2e/chat-widget.spec.ts --grep "constrains|locks the mobile"
```

Expected: PASS at 1440, 768, 767, and 320px viewports.

- [ ] **Step 7: Run the complete widget test file**

Run:

```powershell
pnpm exec playwright test tests/e2e/chat-widget.spec.ts
```

Expected: every widget test PASS with no retries.

- [ ] **Step 8: Commit responsive and accessibility behavior**

```powershell
git add src/components/chat/ChatWidget.astro tests/e2e/chat-widget.spec.ts
git commit -m "feat: polish responsive chat accessibility"
```

---

### Task 6: Full Regression and Security-Boundary Verification

**Files:**
- Modify only if verification reveals a widget-related defect: files already listed in Tasks 1–5.

**Interfaces:**
- Consumes: completed widget, mock transport, layout visibility, and all tests.
- Produces: a clean, tested frontend-only implementation ready for visual review and later HTTP transport replacement.

- [ ] **Step 1: Verify no production transport or secret reference was introduced**

Run:

```powershell
git grep -n -E "fetch\(|XMLHttpRequest|DEEPSEEK_API_KEY|api\.deepseek\.com" -- src/components/chat src/layouts tests/e2e/chat-widget.spec.ts
```

Expected: no matches and exit code 1, meaning the frontend phase contains no network call or DeepSeek secret identifier.

- [ ] **Step 2: Run static and content checks**

Run:

```powershell
pnpm run check
pnpm run validate:content
```

Expected: both commands exit 0 with no Astro or content errors.

- [ ] **Step 3: Run all unit tests**

Run:

```powershell
pnpm run test:unit
```

Expected: all Vitest tests PASS.

- [ ] **Step 4: Run a fresh production build**

Run:

```powershell
pnpm run build
```

Expected: content validation, Astro check, and static build all exit 0.

- [ ] **Step 5: Run the full Playwright regression suite**

Run:

```powershell
pnpm run test:e2e
```

Expected: all existing and new Chromium tests PASS with zero failures.

- [ ] **Step 6: Inspect the final diff and working tree**

Run:

```powershell
git diff main...HEAD --check
git status --short --branch
```

Expected: diff check exits 0; status shows `AI-Assistant-Develop` with no uncommitted implementation files.

- [ ] **Step 7: Create a final corrective commit only if verification required changes**

If and only if a widget-related correction was necessary:

```powershell
git add src/components/chat src/layouts tests/unit/chat-transport.test.ts tests/e2e/chat-widget.spec.ts
git commit -m "fix: complete AI support widget verification"
```

Otherwise, do not create an empty commit.

- [ ] **Step 8: Handoff for visual inspection**

Start the existing preview workflow, inspect the launcher and open panel at 1440×900, 768×700, 767×700, 390×844, and 320×700, and compare them against the two approved design references. Report any intentional differences: flat Shengborun teal treatment, no timestamps/read receipts, restrained robot identity, and viewport-constrained desktop sizing.
