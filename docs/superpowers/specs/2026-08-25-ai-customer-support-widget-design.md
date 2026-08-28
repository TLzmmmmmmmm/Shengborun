# AI Customer Support Widget — Frontend Design

Date: 2026-08-25  
Status: Approved design, pending implementation plan  
Branch: `AI-Assistant-Develop`

## 1. Objective

Add a site-wide AI customer-support widget to the existing Shengborun Astro website. The widget is a compact floating panel on desktop and a near-full-screen conversation experience on mobile.

The first implementation phase is frontend-only. It must provide a complete, testable interaction using a clearly identified local mock transport. It must not connect to FastAPI, DeepSeek, or any other network service.

Usability, reliable state behavior, responsive layout, and accessibility take priority over visual decoration.

## 2. Scope

### Included in the frontend phase

- Floating chat launcher and panel open/close behavior.
- Desktop floating panel and mobile near-full-screen overlay.
- Local initial assistant message and user message composition.
- Local mock response transport with idle, loading, success, and error states.
- Duplicate-submission prevention and message-area auto-scroll.
- Conversation preservation across close/reopen within the current page.
- Keyboard interaction, focus management, responsive behavior, and tests.

### Excluded from the frontend phase

- Real `fetch` or other HTTP requests.
- FastAPI, DeepSeek, or Nginx integration.
- API keys or secrets of any kind.
- Persistence across page refreshes or navigation.
- Server conversation history.
- Quick actions, like/dislike, and a separate minimize control.
- Timestamps and read receipts.
- Backend hardening, authentication, rate limiting, or analytics.

## 3. Site Placement and Visibility

`ChatWidget.astro` is rendered once by `BaseLayout.astro`; it is not inserted into individual business pages.

`BaseLayout.astro` exposes a boolean chat-visibility property whose default is enabled. `LegalLayout.astro` and `PrivacyLayout.astro` explicitly disable the widget. Therefore:

- Home, product, category, solution, support, and about pages show the widget.
- Legal and privacy pages do not render the widget or its client behavior.

The widget is an overlay and must not change document flow, page gutters, header/footer dimensions, or main content width.

## 4. Visual Direction

The component follows the existing Shengborun design system:

- Brand teal and related colors from `tokens.css`.
- Existing system font stack and spacing, border, radius, focus, and transition conventions.
- Clean white and muted surfaces with restrained border and shadow.
- Lucide icons already available in the project.

The visual treatment is professional and minimal. Avoid heavy gradients, glassmorphism, excessive motion, playful decoration, timestamps, and read-status marks.

Robot imagery is restrained. Identity may appear in the launcher and header; individual assistant messages should not repeat a large avatar.

## 5. Component Structure

```text
src/
└── components/
    └── chat/
        ├── ChatWidget.astro
        └── chat-transport.ts
```

`ChatWidget.astro` owns semantic markup, scoped styling, browser state, keyboard behavior, scrolling, and rendering.

`chat-transport.ts` owns the replaceable answer-request boundary. During this phase it exports a clearly named development mock transport and performs no network request.

No React, Vue, or other client framework is added. Implementation follows the existing Astro component and browser TypeScript pattern.

## 6. State Model

```ts
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

messages: Message[];
isOpen: boolean;
isLoading: boolean;
error: string | null;
input: string;
```

Initial messages contain one local assistant message:

```text
您好，请问有什么可以帮助您？
```

The initial message does not call the mock transport or any API.

## 7. Interaction Behavior

### Opening

- Activating the launcher opens the panel.
- Focus moves to the message input.
- The launcher exposes its expanded state semantically.

### Sending

- The send button submits a non-empty trimmed message.
- `Enter` submits; `Shift + Enter` inserts a newline.
- Empty or whitespace-only input is not submitted.
- The user message is appended immediately.
- Loading starts before the mock answer resolves.
- Send is disabled while loading to prevent duplicate submission.

### Success

- The mock returns the future API response shape: `{ answer: string }`.
- The assistant answer is appended.
- Loading and error states are cleared.
- The message list scrolls to the newest message.

### Error

- The error appears inside the message area.
- User-facing text is:

```text
当前 AI 客服暂时无法响应，请稍后重试或通过电话/邮箱联系我们。
```

- Internal errors and API details are never displayed.
- The input becomes usable again after failure.

### Closing

- The close button and `Escape` close the widget.
- Focus returns to the launcher.
- Messages remain in memory while the current page stays loaded.
- Refreshing or navigating to another static page may reset the conversation.

## 8. Development Mock Transport

The frontend phase uses a local asynchronous function that simulates the future request boundary.

The mock:

- Accepts the user's message and waits for a short controlled delay.
- Returns `{ answer: string }` for success scenarios.
- Can reject in controlled tests to exercise the error state.
- Never calls `fetch`, FastAPI, DeepSeek, or the network.
- Never reads or contains an API key.
- Is clearly named and commented as development-only.
- Produces visibly non-production sample text when used interactively.

Automated tests inject or select controlled success, slow, and failure behavior without a live service.

The later backend phase replaces only this boundary with:

```text
POST /api/chat
Request:  { "message": "string" }
Response: { "answer": "string" }
```

The UI state model and rendering do not need to change during replacement.

## 9. Responsive Behavior

### Desktop

- Fixed at bottom-right without affecting page layout.
- Ideal width is about 400px, constrained by viewport width.
- Ideal height is about 620px, constrained by dynamic viewport height.
- The message list flexes while the header and composer remain usable.
- The panel never overflows the viewport.

### Mobile

The existing site breakpoint is authoritative:

```css
@media (max-width: 47.999rem)
```

At this breakpoint the widget becomes a near-full-screen overlay:

- Uses `100dvh` and respects `env(safe-area-inset-*)`.
- Keeps the close control and composer accessible with the soft keyboard.
- Keeps the message list independently scrollable.
- Prevents the underlying website from scrolling while open.

## 10. Accessibility

- Use semantic buttons and accurate `aria-label` values for icon-only controls.
- Interactive targets are approximately 44px or larger.
- Focus styles reuse the site's visible focus convention.
- Open state and launcher state are programmatically exposed.
- Focus moves into the widget on open and returns on close.
- Loading, assistant replies, and errors use an appropriate live region.
- Keyboard users can open, compose, send, insert newlines, and close.
- Motion respects the site's reduced-motion rules.
- Contrast is checked against the final rendered tokens.

## 11. Scrolling and Layout Isolation

- Only the message list scrolls during conversation review.
- New user, loading, success, and error content scrolls into view.
- Widget interactions do not scroll the main website page.
- Mobile body-scroll locking is reliably removed on close or page exit.
- No viewport size introduces horizontal page overflow.

## 12. Test Strategy

Tests are written before implementation and cover real user-visible behavior.

### Component and state behavior

- Initial greeting and blank-input rejection.
- Send button, Enter submission, and Shift+Enter newline.
- Loading transition, disabled send, and duplicate prevention.
- Successful mock response and controlled mock failure.
- Friendly error display and restored input.
- Conversation preservation after close/reopen.
- Auto-scroll to newest content.

### Playwright behavior

- Widget appears on every approved business page family.
- Widget is absent from legal and privacy pages.
- Launcher, open, close, Escape, and focus-return behavior.
- Desktop dimensions remain within the viewport.
- Mobile layout activates at `47.999rem` and remains usable at 320px.
- No horizontal overflow and no background scroll when mobile is open.
- Accessible names and minimum interaction target sizes.

### Project verification

- Astro check and content validation.
- Unit tests and production build.
- Playwright tests at representative desktop and mobile sizes.

## 13. Future Backend Integration

The production architecture remains:

```text
Browser → same-origin POST /api/chat → Nginx reverse proxy → FastAPI V0 → DeepSeek
```

Shengborun remains a static Astro site. Nginx owns same-origin routing. The browser never receives, stores, or transmits the DeepSeek API key.

Backend connection, real network transport, Nginx configuration, and end-to-end integration are a separate later phase.

## 14. Acceptance Criteria

- Widget appears on every approved business page and not on legal/privacy pages.
- Open and close work with pointer and keyboard.
- Desktop and mobile layouts work without viewport overflow.
- Local user messages and mock assistant messages render correctly.
- Loading prevents duplicate submission and friendly error is testable.
- New content auto-scrolls without scrolling the website.
- Conversation survives close/reopen within the current page.
- Mobile keyboard and safe-area structure are supported.
- Focus behavior and accessible names are correct.
- No real HTTP request is made.
- No API key or backend secret exists in frontend source or output.
- Existing website layout and tests remain unaffected.
