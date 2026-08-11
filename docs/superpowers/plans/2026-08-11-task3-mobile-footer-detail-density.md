# Task 3 Mobile Footer Detail Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make expanded mobile Footer child links visually subordinate and exactly 10% more compact vertically without changing section-title styling or desktop layout.

**Architecture:** Keep the existing Footer markup, details/summary behavior, and desktop rules. Add mobile-only overrides for child-list gap and child-link typography/height, protect the values and preserved states with Playwright, and append truthful visual evidence to the existing QA report without adding a repository screenshot.

**Tech Stack:** Astro 6 component-scoped CSS, Playwright with local Chrome, Vitest, pnpm.

## Global Constraints

- Set the mobile child-link font size to exactly `0.875rem` (`14px`).
- Reduce the mobile child-link minimum height from `2.5rem` to exactly `2.25rem` (`36px`), a 10% reduction.
- Reduce the mobile child-list row gap from `0.65rem` to exactly `0.585rem` (`9.36px`), a 10% reduction.
- Keep inherited line height, link color, alignment, interaction behavior, child-list margin, and child-list bottom padding unchanged.
- Keep section-title font size, weight, padding, toggle icon, border styling, and collapsed-group behavior unchanged.
- Do not add compensating blank space; following section titles move upward naturally when expanded content becomes shorter.
- Apply all production styling changes only inside the existing mobile breakpoint.
- Modify only `src/components/layout/Footer.astro`, `tests/e2e/layout.spec.ts`, and `design-qa.md`.
- Do not add, modify, regenerate, or delete any screenshot or other image in the repository; a temporary local capture may be used for comparison and must remain untracked.
- Preserve desktop Footer typography and spacing, Header behavior, content schemas, page content, routes, and legal information.
- Develop and test only through `http://127.0.0.1:4321`.
- Do not access or test the production domain.
- Do not deploy or modify DNS, HTTPS, or servers.
- Do not start Task 4.
- Keep the favicon 404 recorded as a separate, out-of-scope follow-up.
- Preserve unrelated user changes; do not reset, overwrite, delete, or force-push them.

---

## File Structure

- Modify `tests/e2e/layout.spec.ts`: add a focused mobile Footer test for computed child-link values, unchanged section-title styling, open/close interaction, desktop preservation, and natural compacting.
- Modify `src/components/layout/Footer.astro`: add only the approved mobile `gap`, `font-size`, and `min-height` values.
- Modify `design-qa.md`: retain existing Header evidence and append the current mobile Footer comparison and verification result.

No components, routes, dependencies, content files, icons, or repository screenshots are added.

### Task 1: Refine And Verify Mobile Footer Child-Link Density

**Files:**
- Modify: `tests/e2e/layout.spec.ts:207-238`
- Modify: `src/components/layout/Footer.astro:195-236`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: existing `.footer-navigation`, `.footer-group`, `summary`, child `ul`, child links, and the `48rem` breakpoint.
- Produces: mobile expanded child links with computed `14px` font size, `36px` minimum height, and `9.36px` row gap.
- Preserves: details/summary semantics, keyboard and pointer interaction, section-title metrics, child-list bottom padding, desktop computed values, Footer borders, legal layout, and all non-Footer UI.

- [ ] **Step 1: Write the failing browser regression**

Add this test after `renders the approved light footer hierarchy` in `tests/e2e/layout.spec.ts`:

```ts
test('uses compact mobile footer detail hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 647, height: 900 });
  await page.goto('/');

  const groups = page.locator('footer details');
  const firstGroup = groups.first();
  const firstSummary = firstGroup.locator('summary');
  const firstList = firstGroup.locator('ul');
  const firstLink = firstList.getByRole('link').first();

  await expect(firstGroup).not.toHaveAttribute('open', '');
  await firstSummary.click();
  await expect(firstGroup).toHaveAttribute('open', '');

  await expect(firstSummary).toHaveCSS('font-size', '16px');
  await expect(firstSummary).toHaveCSS('padding-top', '16px');
  await expect(firstSummary).toHaveCSS('padding-bottom', '16px');
  await expect(firstList).toHaveCSS('row-gap', '9.36px');
  await expect(firstList).toHaveCSS('padding-bottom', '17.6px');
  await expect(firstLink).toHaveCSS('font-size', '14px');
  await expect(firstLink).toHaveCSS('min-height', '36px');

  await firstSummary.focus();
  await page.keyboard.press('Enter');
  await expect(firstGroup).not.toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(firstGroup).toHaveAttribute('open', '');

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(firstGroup).toHaveAttribute('open', '');
  await expect(firstList).toHaveCSS('row-gap', '10.4px');
  await expect(firstLink).toHaveCSS('font-size', '16px');
});
```

Do not weaken or remove existing Footer, legal-spacing, accessibility, or overflow assertions.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
pnpm run test:e2e -- --grep "uses compact mobile footer detail hierarchy"
```

Expected: FAIL on the first new density assertion because the current mobile child-list gap is `10.4px`, not `9.36px`; the current child-link font size and minimum height also remain `16px` and `40px`. If the assertions complete but Playwright's managed Windows server hangs during teardown, retain the expected assertion failure and use the dedicated external-server procedure in Step 6 for subsequent browser runs.

- [ ] **Step 3: Apply the minimal mobile CSS**

In the existing `@media (max-width: 47.999rem)` block in `src/components/layout/Footer.astro`, update the mobile `ul` and `a` rules to:

```css
ul {
  gap: 0.585rem;
  margin: 0;
  padding-bottom: 1.1rem;
}

a {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  font-size: 0.875rem;
}
```

Do not change the global `ul` or `a` rules, the mobile `summary` rule, `.footer-group`, `.footer-navigation`, or `.footer-legal`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
pnpm run test:e2e -- --grep "uses compact mobile footer detail hierarchy"
```

Expected: PASS with the approved mobile computed values, unchanged title metrics, working keyboard state changes, and unchanged desktop font/gap values.

- [ ] **Step 5: Run non-browser verification**

Run each command separately:

```powershell
pnpm run test:unit
pnpm run validate:content
$env:ASTRO_TELEMETRY_DISABLED = '1'
pnpm run check
pnpm run build
```

Expected: all unit tests pass, content references are valid, Astro reports zero errors/warnings/hints, and the static build completes.

- [ ] **Step 6: Run the full browser suite against a dedicated local server**

Use a hidden local server so Playwright does not own Windows process teardown:

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

Expected: all browser tests pass, including the new mobile Footer density test, open/close accessibility, desktop Footer assertions, legal spacing, and horizontal-overflow coverage. Only the server created by this step is stopped.

- [ ] **Step 7: Capture temporary local evidence and complete blocking visual QA**

Start and stop a dedicated hidden local server. With local Chrome, use a `647 × 900` CSS viewport, open the first two Footer groups, scroll the Footer navigation into view, and save a temporary crop outside the repository:

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
$capturePath = Join-Path $env:TEMP 'shengborun-mobile-footer-detail-density.png'
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
  node --input-type=module -e "import { chromium } from '@playwright/test'; const browser = await chromium.launch({ channel: 'chrome' }); const page = await browser.newPage({ viewport: { width: 647, height: 900 }, deviceScaleFactor: 1 }); const errors = []; page.on('console', (message) => { if (message.type() === 'error') errors.push({ text: message.text(), url: message.location().url }); }); page.on('pageerror', (error) => errors.push({ text: error.message, url: '' })); await page.goto('http://127.0.0.1:4321'); const groups = page.locator('footer details'); await groups.nth(0).locator('summary').click(); await groups.nth(1).locator('summary').click(); await groups.nth(0).scrollIntoViewIfNeeded(); const first = await groups.nth(0).boundingBox(); const secondList = await groups.nth(1).locator('ul').boundingBox(); if (!first || !secondList) throw new Error('Unable to measure Footer comparison crop.'); await page.screenshot({ path: process.argv[1], clip: { x: 0, y: first.y, width: 647, height: secondList.y + secondList.height - first.y } }); await browser.close(); console.log(JSON.stringify(errors)); const unexpected = errors.filter((entry) => !entry.url.endsWith('/favicon.ico')); if (unexpected.length) throw new Error(JSON.stringify(unexpected));" $capturePath
  $captureExit = $LASTEXITCODE
} finally {
  $server.Refresh()
  if (-not $server.HasExited) { Stop-Process -Id $server.Id }
}
if ($captureExit -ne 0) { exit $captureExit }
```

Open the source and temporary implementation image together in one comparison input:

- Source: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-880c456e-68a4-4d97-8cf6-14a1d436ff94.png`
- Implementation: `$env:TEMP\shengborun-mobile-footer-detail-density.png`

Compare the same expanded state, focusing on the stronger title/link hierarchy, smaller link text, 10% tighter link rhythm, unchanged title typography/padding, unchanged colors and borders, and natural upward movement of the following title. The temporary capture is evidence only: do not add it to Git or modify any repository screenshot.

Update `design-qa.md` as follows:

- change the document title to `# Shengborun Visual QA` while retaining all existing Header evidence;
- insert a `## Mobile Footer Detail Density QA` section immediately before the single final-result line;
- record both evidence paths, the `647 × 900` viewport, device scale factor `1`, route `/`, and first-two-groups-open state;
- record computed values `14px`, `36px`, and `9.36px`, plus unchanged `16px` title size and `16px` title block padding;
- record pointer/keyboard open-close checks, desktop preservation, overflow result, and visual comparison findings;
- retain the favicon 404 as the accepted out-of-scope P3 follow-up;
- keep exactly one final line, `final result: passed`, only if no actionable P0/P1/P2 difference remains.

If the source file is no longer available or the images cannot be compared together, set `final result: blocked`, do not commit, and report the blocker. Do not access the production domain or deploy.

- [ ] **Step 8: Review scope, stage, commit, and push**

Run:

```powershell
git diff --check
git status --short --branch
git diff -- src/components/layout/Footer.astro tests/e2e/layout.spec.ts design-qa.md
git diff --name-only
```

Confirm exactly the three planned files changed, `design-qa.md` ends with `final result: passed`, and no PNG or other image changed. Then run:

```powershell
git add src/components/layout/Footer.astro tests/e2e/layout.spec.ts design-qa.md
git commit -m "fix: refine mobile footer detail density"
git push origin codex/site-foundation
git status --short --branch
```

Expected: the commit and push succeed; the worktree is clean and `codex/site-foundation` is synchronized with `origin/codex/site-foundation`. Keep the worktree and branch, do not merge to `main`, do not create a PR, and stop without starting Task 4.
