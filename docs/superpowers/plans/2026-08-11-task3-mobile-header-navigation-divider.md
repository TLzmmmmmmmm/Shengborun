# Task 3 Mobile Header Navigation Divider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile Header navigation use one compact bottom border for gray dividers, hover feedback, and the current-page indicator.

**Architecture:** Keep the existing Header markup, route logic, and desktop pseudo-element indicator. At the existing mobile breakpoint, hide the pseudo-element and move all visual states onto the link's real `1px` bottom border, using a transparent final-row border to preserve geometry without showing a trailing divider.

**Tech Stack:** Astro 6 component-scoped CSS, Playwright with the computer's existing Chrome, pnpm.

## Global Constraints

- This is a focused Task 3 visual correction; do not start Task 4 or create routes.
- At mobile widths, reduce link minimum height from `3rem` to `2.4rem`, exactly 20%.
- Use one physical `1px` bottom border for inactive, hover, and current states.
- Keep “关于我们” visually borderless when inactive and not hovered, but teal when hovered or current.
- Preserve the existing desktop indicator and all Header markup, JavaScript, navigation data, accessibility semantics, Header height, and Logo sizing.
- Preserve Footer, content schemas, global tokens, routes, and page content.
- Production/test source changes are limited to `Header.astro` and `layout.spec.ts`; add only the required QA report and screenshot evidence.
- Use the existing local Chrome/Playwright setup and only the local preview address `http://127.0.0.1:4321`.
- Do not deploy, access or test the production domain, or modify DNS, HTTPS, or servers.
- Preserve unrelated user changes; do not reset, overwrite, delete, or force-push them.

---

## File Structure

- Modify `tests/e2e/layout.spec.ts`: protect the compact mobile row height and every border state with real browser assertions.
- Modify `src/components/layout/Header.astro`: implement the approved mobile-only border behavior.
- Create `docs/superpowers/qa/2026-08-11-mobile-header-navigation.png`: browser-rendered implementation evidence at a `320px` viewport with the menu open.
- Create `design-qa.md`: record the source/implementation comparison, interaction checks, findings, and final QA result.

The existing Astro project is the implementation target. Do not initialize a Product Design prototype template or add dependencies.

---

### Task 1: Implement And Verify The Mobile Navigation Divider States

**Files:**
- Modify: `tests/e2e/layout.spec.ts:239-287`
- Modify: `src/components/layout/Header.astro:145-176`
- Create: `docs/superpowers/qa/2026-08-11-mobile-header-navigation.png`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: existing `.primary-navigation`, link `aria-current="page"`, `var(--divider)`, `var(--brand-teal)`, and the `48rem` breakpoint.
- Produces: mobile links with `min-height: 2.4rem`, a single stable `1px` border, gray inactive rows, teal hover/current rows, and a transparent inactive final row.
- Preserves: desktop `::after` animation, menu open/close behavior, navigation URLs, accessibility attributes, and all non-Header UI.

- [ ] **Step 1: Write the failing browser regression test**

Add this test before the existing horizontal-overflow test in `tests/e2e/layout.spec.ts`:

```ts
test('uses one compact border line for mobile navigation states', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开主导航' }).click();

  const navigation = page.getByRole('navigation', { name: '主导航' });
  const home = navigation.getByRole('link', { name: '首页', exact: true });
  const products = navigation.getByRole('link', {
    name: '产品中心',
    exact: true,
  });
  const about = navigation.getByRole('link', { name: '关于我们', exact: true });

  await expect(home).toHaveCSS('min-height', '38.4px');
  await expect(home).toHaveCSS('border-bottom-width', '1px');
  await expect(home).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
  await expect(products).toHaveCSS('border-bottom-color', 'rgb(232, 232, 237)');
  expect(
    await home.evaluate((element) => getComputedStyle(element, '::after').display),
  ).toBe('none');

  const productsBeforeHover = (await products.boundingBox())!;
  await products.hover();
  await expect(products).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
  const productsAfterHover = (await products.boundingBox())!;
  expect(productsAfterHover.height).toBeCloseTo(productsBeforeHover.height, 5);

  await expect(about).toHaveCSS('border-bottom-width', '1px');
  await expect(about).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
  await about.hover();
  await expect(about).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');

  await page.mouse.move(0, 0);
  await home.evaluate((element) => element.removeAttribute('aria-current'));
  await about.evaluate((element) => element.setAttribute('aria-current', 'page'));
  await expect(about).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
});
```

The production change that makes this test pass is the mobile CSS override: without it, the active teal line remains a pseudo-element, links remain `3rem` tall, and the last link has no real border.

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
pnpm run test:e2e -- --grep "uses one compact border line for mobile navigation states"
```

Expected: FAIL first at the minimum-height assertion because the current computed value is `48px`, not `38.4px`. The old current link also retains a gray real border and a displayed teal pseudo-element.

If the local Windows runner completes the assertions but hangs while Playwright tears down its managed server, preserve the failure output and use the dedicated local-server procedure from Step 6 for subsequent browser runs. Do not treat a timeout without the expected assertion failure as valid RED evidence.

- [ ] **Step 3: Implement the minimal mobile-only CSS**

Inside the existing `@media (max-width: 47.999rem)` block in `src/components/layout/Header.astro`, replace the current mobile link and last-child rules with:

```css
.primary-navigation a {
  min-height: 2.4rem;
  border-bottom: 1px solid var(--divider);
}

.primary-navigation a::after {
  display: none;
}

.primary-navigation li:last-child a {
  border-bottom-color: transparent;
}

.primary-navigation a:hover,
.primary-navigation a[aria-current='page'] {
  border-bottom-color: var(--brand-teal);
}
```

Keep the state rule after the final-child rule so hover and current teal override the transparent inactive border. Do not change the desktop `::after` rule outside the media query.

- [ ] **Step 4: Run the focused browser test and verify GREEN**

Run:

```powershell
pnpm run test:e2e -- --grep "uses one compact border line for mobile navigation states"
```

Expected: PASS. Confirm the link height stays unchanged during hover, proving that only border color changes.

- [ ] **Step 5: Run the complete automated verification suite**

Run each command separately:

```powershell
pnpm run test:unit
pnpm run validate:content
$env:ASTRO_TELEMETRY_DISABLED='1'
pnpm run check
pnpm run build
```

Expected:

- all unit tests pass;
- content validation reports success;
- Astro check reports zero errors, warnings, and hints;
- the static build completes.

- [ ] **Step 6: Run all browser tests against a dedicated local server**

Use a hidden server process so Playwright does not own Windows process teardown:

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
$server = Start-Process -FilePath node -ArgumentList './node_modules/astro/bin/astro.mjs','dev','--host','127.0.0.1' -WorkingDirectory 'D:\Shengborun\.worktrees\site-foundation' -WindowStyle Hidden -PassThru
$testExit = 1
try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 90; $attempt++) {
    $server.Refresh()
    if ($server.HasExited) { throw "Local Astro server exited with code $($server.ExitCode)." }
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
      $connect = $client.ConnectAsync('127.0.0.1', 4321)
      if ($connect.Wait(500) -and $client.Connected) { $ready = $true; break }
    } catch {} finally { $client.Dispose() }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'Local Astro server did not listen on port 4321 within 90 seconds.' }
  $env:PLAYWRIGHT_EXTERNAL_SERVER = '1'
  pnpm run test:e2e
  $testExit = $LASTEXITCODE
} finally {
  $server.Refresh()
  if (-not $server.HasExited) { Stop-Process -Id $server.Id }
}
exit $testExit
```

Expected: every end-to-end test passes, including the new mobile border-state regression. Only the process created in this step is stopped.

- [ ] **Step 7: Capture the approved mobile state in existing Chrome**

Run this complete capture procedure, which starts and stops its own hidden local server and fails if the page emits a console or runtime error:

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
$server = Start-Process -FilePath node -ArgumentList './node_modules/astro/bin/astro.mjs','dev','--host','127.0.0.1' -WorkingDirectory 'D:\Shengborun\.worktrees\site-foundation' -WindowStyle Hidden -PassThru
$captureExit = 1
try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 90; $attempt++) {
    $server.Refresh()
    if ($server.HasExited) { throw "Local Astro server exited with code $($server.ExitCode)." }
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
      $connect = $client.ConnectAsync('127.0.0.1', 4321)
      if ($connect.Wait(500) -and $client.Connected) { $ready = $true; break }
    } catch {} finally { $client.Dispose() }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'Local Astro server did not listen on port 4321 within 90 seconds.' }
  New-Item -ItemType Directory -Force -Path docs\superpowers\qa | Out-Null
  node --input-type=module -e "import { chromium } from '@playwright/test'; const browser = await chromium.launch({ channel: 'chrome' }); const page = await browser.newPage({ viewport: { width: 320, height: 700 }, deviceScaleFactor: 1 }); const errors = []; page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); }); page.on('pageerror', (error) => errors.push(error.message)); await page.goto('http://127.0.0.1:4321'); await page.getByRole('button', { name: '打开主导航' }).click(); await page.screenshot({ path: 'docs/superpowers/qa/2026-08-11-mobile-header-navigation.png', fullPage: false }); await browser.close(); if (errors.length) throw new Error(errors.join('\n'));"
  $captureExit = $LASTEXITCODE
} finally {
  $server.Refresh()
  if (-not $server.HasExited) { Stop-Process -Id $server.Id }
}
exit $captureExit
```

Expected: the screenshot is `320px` wide, shows the open menu, has one teal line at the bottom of “首页”, gray dividers for middle inactive rows, no visible line below inactive “关于我们”, visibly tighter vertical rhythm, and no browser console errors. Only the server created by this procedure is stopped.

- [ ] **Step 8: Perform blocking visual QA and write the evidence report**

Open the source screenshot and implementation screenshot together in one comparison input:

- Source: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-9b4a10cb-7cb7-4026-b020-a7df43430cb7.png`
- Implementation: `docs/superpowers/qa/2026-08-11-mobile-header-navigation.png`

Compare the open-menu state, focusing on typography, 20% tighter spacing, divider positions, teal/gray colors, text content, and the absence of the duplicate active line. Also confirm that no image assets are involved and that the screenshot uses the real Header component.

Create `design-qa.md` with:

- both evidence paths;
- source dimensions `216 × 473px` and the measured implementation dimensions;
- CSS viewport `320 × 700`, device scale factor `1`, route `/`, and open-menu state;
- primary interaction checks for menu open, hover, current state, Escape close, and no horizontal overflow;
- console-error result from the browser run;
- full-view comparison findings and a focused divider/spacing comparison;
- a history entry for every P0/P1/P2 issue, fix, and recapture, if any;
- one of the exact final lines `final result: passed` or `final result: blocked`.

If any actionable P0/P1/P2 difference is found, keep the report blocked, add a failing browser assertion for the discrepancy, apply the minimal fix, rerun verification, recapture, and compare again. Do not hand off with `final result: blocked`.

- [ ] **Step 9: Review the final scope, stage, commit, and push**

Run:

```powershell
git diff --check
git status --short --branch
git diff -- src/components/layout/Header.astro tests/e2e/layout.spec.ts design-qa.md
```

Inspect the PNG with the local image viewer and confirm that only these four planned files are new or modified. Then run:

```powershell
git add src/components/layout/Header.astro tests/e2e/layout.spec.ts design-qa.md docs/superpowers/qa/2026-08-11-mobile-header-navigation.png
git commit -m "fix: unify mobile header navigation dividers"
git push origin codex/site-foundation
git status --short --branch
```

Expected: commit and push succeed; the final worktree is clean and `codex/site-foundation` is synchronized with `origin/codex/site-foundation`. Keep the worktree and branch, do not merge to `main`, do not create a PR, and stop without starting another task.
