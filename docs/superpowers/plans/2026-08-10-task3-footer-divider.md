# Task 3 Footer Divider Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Footer dividers slightly more visible with `#DADAE0` while leaving Header and global divider styling unchanged.

**Architecture:** Add a Footer-scoped CSS custom property and consume it in the three existing Footer border rules. Extend the real-browser layout test to verify computed border colors on desktop and mobile.

**Tech Stack:** Astro 6, scoped CSS, TypeScript, Playwright, pnpm.

## Global Constraints

- Work only in `D:\Shengborun\.worktrees\site-foundation` on `codex/site-foundation`.
- Footer divider color is exactly `#DADAE0` (`rgb(218, 218, 224)`).
- All Footer dividers remain `1px solid`.
- The global `--divider: #E8E8ED` token remains unchanged so mobile Header dividers do not change.
- No navigation, spacing, typography, content, route, or component-interface changes.
- Use only local test address `http://127.0.0.1:4321`.
- Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.

---

### Task 1: Footer-specific divider color

**Files:**
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `src/components/layout/Footer.astro`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: existing `.site-footer`, `.footer-breadcrumb`, `.footer-legal`, and `.footer-group` selectors.
- Produces: a Footer-scoped `--footer-divider` custom property; component markup and props remain unchanged.

- [ ] **Step 1: Write failing browser assertions**

In `renders the approved light footer hierarchy`, assert the two desktop rules:

```ts
await expect(footer.locator('.footer-breadcrumb')).toHaveCSS(
  'border-bottom-color',
  'rgb(218, 218, 224)',
);
await expect(footer.locator('.footer-legal')).toHaveCSS(
  'border-top-color',
  'rgb(218, 218, 224)',
);
```

In the `320px` branch of the responsive test, assert a Footer group divider:

```ts
await expect(firstFooterGroup).toHaveCSS(
  'border-bottom-color',
  'rgb(218, 218, 224)',
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Start the local Astro server at `127.0.0.1:4321`, set `PLAYWRIGHT_EXTERNAL_SERVER=1`, and run:

```powershell
.\node_modules\.bin\playwright.CMD test tests/e2e/layout.spec.ts --reporter=line
```

Expected: the new assertions fail because the computed border color is still `rgb(232, 232, 237)`.

- [ ] **Step 3: Implement the minimum CSS change**

In `Footer.astro`, define the scoped token:

```css
.site-footer {
  --footer-divider: #dadae0;
}
```

Keep the existing declarations on `.site-footer`, and change only these border references:

```css
border-bottom: 1px solid var(--footer-divider);
border-top: 1px solid var(--footer-divider);
border-bottom: 1px solid var(--footer-divider);
```

The three replacements correspond to `.footer-breadcrumb`, `.footer-legal`, and the mobile `.footer-group` rule.

Update `docs/PROJECT_STATUS.md` to record the Footer-specific `#DADAE0` divider and the related design/plan commits.

- [ ] **Step 4: Run focused verification and verify GREEN**

Run the same seven layout tests against the explicitly started local server.

Expected: `7 passed`; the desktop and mobile computed border colors match `rgb(218, 218, 224)`.

- [ ] **Step 5: Run complete verification**

Run unit tests and the static build:

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

Stage only the implementation, test, and status files:

```powershell
git add -- tests/e2e/layout.spec.ts src/components/layout/Footer.astro docs/PROJECT_STATUS.md
git commit -m "fix: deepen footer divider color"
git push origin codex/site-foundation
```

Verify the branch is clean and `HEAD...@{upstream}` is `0 0`. Stop without starting Task 4.
