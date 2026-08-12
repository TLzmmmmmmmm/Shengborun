# Task 3 Mobile Footer Separator And Rhythm Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the final mobile navigation-group border, remove the legal row's duplicate mobile border, and match the copyright spacing to the Footer title rhythm without rewriting Git history.

**Architecture:** Keep commit `4c79a4e` in history and supersede its CSS with one corrective commit. Extend Playwright coverage at `320px`, `767px`, and `768px`, then change only the mobile rules in the shared Footer component.

**Tech Stack:** Astro 6, scoped CSS, TypeScript, Playwright, pnpm.

## Global Constraints

- Work only in `D:\Shengborun\.worktrees\site-foundation` on `codex/site-foundation`.
- Do not reset, rewrite history, or force-push; keep `4c79a4e` and add a corrective commit.
- Below `48rem`, every Footer navigation group keeps a `1px solid #DADAE0` bottom border.
- Below `48rem`, `.footer-legal` has no top border.
- Below `48rem`, `.footer-navigation` uses `padding-block: 1rem 0` and `.footer-legal` uses `padding-block: 1rem 1.25rem`.
- At `48rem` and above, the existing desktop group borders, legal border, and padding remain unchanged.
- No markup, JavaScript, text, colors, typography, links, or component-interface changes.
- Use only local test address `http://127.0.0.1:4321`.
- Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.

---

### Task 1: Correct the mobile separator and vertical rhythm

**Files:**
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `src/components/layout/Footer.astro`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: existing `.footer-navigation`, `.footer-group`, `.footer-legal`, and ordered Footer summary elements.
- Produces: unchanged component markup/API; only mobile computed border ownership and vertical spacing change.

- [ ] **Step 1: Write failing browser assertions**

Replace the prior mobile last-group `0px` assertion with a dedicated real-layout test:

```ts
test('uses the final navigation border and matches mobile legal spacing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');

  const footerGroups = page.locator('footer details');
  const lastFooterGroup = footerGroups.last();
  const legal = page.locator('.footer-legal');

  await expect(lastFooterGroup).toHaveCSS('border-bottom-width', '1px');
  await expect(lastFooterGroup).toHaveCSS(
    'border-bottom-color',
    'rgb(218, 218, 224)',
  );
  await expect(legal).toHaveCSS('border-top-width', '0px');

  await page.setViewportSize({ width: 767, height: 900 });
  const summaries = page.locator('footer summary');
  const previousTitle = (await summaries.nth(3).boundingBox())!;
  const finalTitle = (await summaries.nth(4).boundingBox())!;
  const copyright = (await legal.locator(':scope > span').first().boundingBox())!;
  const centerY = (box: { y: number; height: number }) => box.y + box.height / 2;
  const titleStep = centerY(finalTitle) - centerY(previousTitle);
  const legalStep = centerY(copyright) - centerY(finalTitle);
  expect(Math.abs(legalStep - titleStep)).toBeLessThanOrEqual(2);

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(legal).toHaveCSS('border-top-width', '1px');
  await expect(legal).toHaveCSS('border-top-color', 'rgb(218, 218, 224)');
});
```

Keep the existing first-group border assertion in the responsive interaction test, but remove its superseded last-group `0px` and mobile legal-border assertions so each behavior has one owner.

- [ ] **Step 2: Run focused verification and observe RED**

Start Astro at `127.0.0.1:4321`, set `PLAYWRIGHT_EXTERNAL_SERVER=1`, and run:

```powershell
.\node_modules\.bin\playwright.CMD test tests/e2e/layout.spec.ts --reporter=line
```

Expected: the new test fails because the final group is `0px` and the mobile legal border is `1px` before the spacing comparison is reached.

- [ ] **Step 3: Implement the minimum mobile CSS correction**

In the mobile media query in `Footer.astro`:

```css
.footer-navigation {
  padding-block: 1rem 0;
}
```

Delete the `.footer-group:last-child { border-bottom: 0; }` override.

Extend the existing mobile `.footer-legal` rule to:

```css
.footer-legal {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding-block: 1rem 1.25rem;
  border-top: 0;
}
```

Update `docs/PROJECT_STATUS.md` to replace the superseded last-group statement with the corrected single-separator/rhythm behavior and record the new design/plan commits.

- [ ] **Step 4: Run focused verification and observe GREEN**

Run the layout file again against the local server.

Expected: all layout tests pass; the final group owns the mobile separator, the legal border is absent below `48rem`, spacing differs by no more than `2px`, and the desktop legal border returns at `768px`.

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

Expected: all unit, content, Astro, build, and browser tests pass; `git diff --check` reports no errors. Stop the local server.

- [ ] **Step 6: Commit and push the correction**

```powershell
git add -- tests/e2e/layout.spec.ts src/components/layout/Footer.astro docs/PROJECT_STATUS.md
git commit -m "fix: correct mobile footer separator rhythm"
git push origin codex/site-foundation
```

Verify the worktree is clean and `HEAD...@{upstream}` is `0 0`. Stop without starting Task 4.
