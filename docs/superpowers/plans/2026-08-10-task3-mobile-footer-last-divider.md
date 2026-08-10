# Task 3 Mobile Footer Last Divider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the redundant line below the final mobile Footer navigation group while retaining the navigation-to-legal separator.

**Architecture:** Extend the real-browser mobile test to distinguish the first group, final group, and legal-row borders. Add one mobile-only CSS override for the last group; preserve existing markup, JavaScript, colors, and desktop behavior.

**Tech Stack:** Astro 6, scoped CSS, TypeScript, Playwright, pnpm.

## Global Constraints

- Work only in `D:\Shengborun\.worktrees\site-foundation` on `codex/site-foundation`.
- At widths below `48rem`, only the final Footer group has no bottom border.
- Earlier mobile Footer groups keep `1px solid #DADAE0` bottom borders.
- `.footer-legal` keeps its `1px solid #DADAE0` top border.
- Desktop Footer styling remains unchanged.
- No markup, JavaScript, spacing, typography, content, navigation, or component-interface changes.
- Use only local test address `http://127.0.0.1:4321`.
- Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.

---

### Task 1: Remove the final mobile navigation-group divider

**Files:**
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `src/components/layout/Footer.astro`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: the existing ordered `.footer-group` elements and `.footer-legal` border.
- Produces: unchanged markup and component APIs; only the last mobile group's computed bottom-border width changes.

- [ ] **Step 1: Write failing browser assertions**

In the existing `320px` branch of `keeps navigation usable and avoids horizontal overflow`, keep the first-group color assertion and add literal width assertions:

```ts
await expect(firstFooterGroup).toHaveCSS('border-bottom-width', '1px');

const lastFooterGroup = page.locator('footer details').last();
await expect(lastFooterGroup).toHaveCSS('border-bottom-width', '0px');

const legal = page.locator('.footer-legal');
await expect(legal).toHaveCSS('border-top-color', 'rgb(218, 218, 224)');
await expect(legal).toHaveCSS('border-top-width', '1px');
```

- [ ] **Step 2: Run the focused test and verify RED**

Start the local Astro server at `127.0.0.1:4321`, set `PLAYWRIGHT_EXTERNAL_SERVER=1`, and run:

```powershell
.\node_modules\.bin\playwright.CMD test tests/e2e/layout.spec.ts --reporter=line
```

Expected: the last-group assertion fails with received `1px`; the earlier group and legal border assertions pass.

- [ ] **Step 3: Implement the minimum CSS change**

Immediately after the existing mobile `.footer-group` rule in `Footer.astro`, add:

```css
.footer-group:last-child {
  border-bottom: 0;
}
```

Update `docs/PROJECT_STATUS.md` to state that the final mobile Footer group has no bottom border and to record the related design and plan commits.

- [ ] **Step 4: Run focused verification and verify GREEN**

Run the same seven layout tests against the explicitly started local server.

Expected: `7 passed`; first group remains `1px`, final group is `0px`, and legal top border remains `1px #DADAE0`.

- [ ] **Step 5: Run complete verification**

Run:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
pnpm run test:unit
pnpm run build
git diff --check
```

Then run all Playwright tests against the explicitly started local server:

```powershell
$env:PLAYWRIGHT_EXTERNAL_SERVER='1'
.\node_modules\.bin\playwright.CMD test --reporter=line
```

Expected: all unit, content, Astro, build, and eight browser tests pass; `git diff --check` reports no errors. Stop the local server after testing.

- [ ] **Step 6: Commit and push**

```powershell
git add -- tests/e2e/layout.spec.ts src/components/layout/Footer.astro docs/PROJECT_STATUS.md
git commit -m "fix: remove redundant mobile footer divider"
git push origin codex/site-foundation
```

Verify the worktree is clean and `HEAD...@{upstream}` is `0 0`. Stop without starting Task 4.
