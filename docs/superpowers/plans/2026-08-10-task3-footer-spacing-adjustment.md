# Task 3 Footer And Gutter Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase Footer readability, consolidate its FAQ entry, enlarge shared horizontal gutters by 20%, and left-align the legal row without changing unrelated site behavior.

**Architecture:** Keep the current shared-component structure. Update consumer-visible behavior in the existing Footer component, the shared gutter token, the Footer breadcrumb typography, and the existing Playwright layout specification; do not add runtime helpers or dependencies.

**Tech Stack:** Astro 5, TypeScript, CSS, Playwright, pnpm.

## Global Constraints

- Work only in `D:\Shengborun\.worktrees\site-foundation` on `codex/site-foundation`.
- Preserve the existing uncommitted Footer wording `版权所有 © 2026 北京盛博润通信设备有限公司` without restoring its removed final punctuation.
- Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.
- Use only the local preview address `http://127.0.0.1:4321`.
- Footer breadcrumb, headings, and links use `16px`; legal text uses `14px`.
- The Footer contains exactly one `常见问题` link with `href="/support/faq/"`.
- The shared gutter is `clamp(1rem, 7.5vw, 9rem)`.
- The legal row is left-aligned on desktop and mobile.

---

### Task 1: Footer readability, FAQ, gutter, and legal alignment

**Files:**
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `src/components/layout/Footer.astro`
- Modify: `src/components/layout/Breadcrumbs.astro`
- Modify: `src/styles/tokens.css`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: `.site-container` and the `--page-gutter` token already used by Header, main content, and Footer.
- Produces: unchanged component APIs; only rendered navigation, typography, gutter size, and alignment change.

- [ ] **Step 1: Write failing browser assertions**

Update the existing Footer and gutter tests to assert literal consumer-visible results:

```ts
const faqLinks = footer.getByRole('link', { name: '常见问题', exact: true });
await expect(faqLinks).toHaveCount(1);
await expect(faqLinks).toHaveAttribute('href', '/support/faq/');
await expect(footer).not.toContainText('全部常见问题');

await expect(footer.locator('.footer-breadcrumb .breadcrumbs')).toHaveCSS('font-size', '16px');
await expect(footer.locator('summary').first()).toHaveCSS('font-size', '16px');
await expect(footerNavigation.getByRole('link').first()).toHaveCSS('font-size', '16px');
await expect(footer.locator('.footer-legal')).toHaveCSS('font-size', '14px');
await expect(footer.locator('.footer-legal')).toHaveCSS('justify-content', 'flex-start');
await expect(footer.locator('.footer-legal')).toHaveCSS('text-align', 'left');
```

For the gutter test, require symmetric padding with a maximum rounded tolerance of `145px` and require at least `143px` at a `2560px` viewport.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
pnpm run test:e2e -- layout.spec.ts
```

Expected failures must identify the old duplicate FAQ entries/link, old `14px`/`12px` Footer sizes, centered legal row, or old `120px` maximum gutter. An infrastructure error does not count as RED.

- [ ] **Step 3: Implement the minimum production changes**

In `Footer.astro`:

- Remove the `/support#faq` entry.
- Rename `全部常见问题` to `常见问题` while preserving `/support/faq/`.
- Set `summary` and Footer links to `1rem`.
- Set `.footer-legal` to `font-size: 0.875rem`, `justify-content: flex-start`, and `text-align: left`.
- In the mobile rule, set `.footer-legal { align-items: flex-start; }` while preserving vertical stacking.
- Preserve the existing copyright wording without its final punctuation.

In `Breadcrumbs.astro`, set `.breadcrumbs { font-size: 1rem; }`.

In `tokens.css`, set:

```css
--page-gutter: clamp(1rem, 7.5vw, 9rem);
```

Update `docs/PROJECT_STATUS.md` with the new Footer typography, FAQ link, gutter maximum, legal alignment, and the latest revision commits.

- [ ] **Step 4: Run focused verification and verify GREEN**

Run:

```powershell
pnpm run test:e2e -- layout.spec.ts
```

Expected: all layout tests pass with no horizontal overflow at `320`, `768`, `1440`, `1920`, and `2560` widths.

- [ ] **Step 5: Run complete verification**

Run:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
pnpm test
git diff --check
```

Expected: all unit tests, content validation, Astro checks, build, and browser tests pass; `git diff --check` prints no errors.

- [ ] **Step 6: Commit and push the implementation**

Stage only the five implementation/test/status files, then commit and push:

```powershell
git add -- tests/e2e/layout.spec.ts src/components/layout/Footer.astro src/components/layout/Breadcrumbs.astro src/styles/tokens.css docs/PROJECT_STATUS.md
git commit -m "fix: enlarge footer text and page gutters"
git push origin codex/site-foundation
```

Finally verify `git status --short --branch`, the latest commit, and `HEAD...@{upstream}`. Stop without starting Task 4.
