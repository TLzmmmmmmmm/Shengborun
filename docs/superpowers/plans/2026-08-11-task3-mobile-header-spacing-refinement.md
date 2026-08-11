# Task 3 Mobile Header Navigation Spacing Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase mobile primary-navigation row height to `2.7rem` (`43.2px`) while preserving every existing divider state and desktop behavior.

**Architecture:** Keep the existing Header markup, breakpoint, and single-border state model. Change one mobile CSS value and update the existing Playwright regression so the approved computed height is protected without introducing a new component or abstraction.

**Tech Stack:** Astro 6 component-scoped CSS, Playwright, Vitest, pnpm.

## Global Constraints

- Set each mobile navigation link's minimum height to exactly `2.7rem` (`43.2px` at the existing `16px` root font size).
- Preserve gray inactive middle dividers, teal hover/current dividers, and the transparent inactive final-row divider.
- Preserve the mobile breakpoint, Header height, Logo size, navigation labels and URLs, accessibility behavior, desktop navigation, Footer, content, and routes.
- Modify only `src/components/layout/Header.astro`, `tests/e2e/layout.spec.ts`, and `design-qa.md`.
- Do not generate, update, or delete a screenshot; retain the existing screenshot only as explicitly labelled pre-refinement historical evidence.
- Develop and test only through `http://127.0.0.1:4321`.
- Do not access or test the production domain.
- Do not deploy or modify DNS, HTTPS, or servers.
- Do not start Task 4.
- Keep the existing favicon 404 recorded as a separate, out-of-scope follow-up.
- Preserve unrelated user changes; do not reset, overwrite, delete, or force-push them.

---

## File Structure

- Modify `tests/e2e/layout.spec.ts`: change the existing mobile navigation computed-height expectation from `38.4px` to `43.2px` while retaining all divider-state assertions.
- Modify `src/components/layout/Header.astro`: change only the mobile navigation link minimum height from `2.4rem` to `2.7rem`.
- Modify `design-qa.md`: record `43.2px` as the current browser-tested height and identify the unchanged screenshot as historical evidence captured before this refinement.

No files, components, dependencies, routes, screenshots, or assets are added, removed, or regenerated.

### Task 1: Refine And Verify Mobile Navigation Row Height

**Files:**
- Modify: `tests/e2e/layout.spec.ts:239-275`
- Modify: `src/components/layout/Header.astro:242-260`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: existing `.primary-navigation a` mobile rule and the Playwright test named `uses one compact border line for mobile navigation states`.
- Produces: a computed mobile link minimum height of `43.2px` with unchanged border colors, widths, hover/current behavior, and geometry stability.
- Preserves: all Header markup, JavaScript, route logic, accessibility attributes, desktop styles, and non-Header UI.

- [ ] **Step 1: Change the browser expectation first**

In `tests/e2e/layout.spec.ts`, change only the expected minimum height:

```ts
await expect(home).toHaveCSS('min-height', '43.2px');
```

Keep the existing assertions for the `1px` real border, teal current state, gray inactive state, hidden mobile pseudo-element, hover geometry stability, and transparent/hover/current final row.

- [ ] **Step 2: Run the focused test and verify RED**

Run against the existing local Playwright setup:

```powershell
pnpm run test:e2e -- --grep "uses one compact border line for mobile navigation states"
```

Expected: FAIL because the implementation still computes `min-height: 38.4px`, not `43.2px`. If Playwright completes the assertion but its managed Windows server hangs during teardown, retain the assertion output and use the dedicated external-server procedure in Step 6 for subsequent browser verification.

- [ ] **Step 3: Apply the minimal CSS change**

In the existing mobile media query in `src/components/layout/Header.astro`, change only the minimum height:

```css
.primary-navigation a {
  min-height: 2.7rem;
  border-bottom: 1px solid var(--divider);
}
```

Do not change the adjacent pseudo-element, last-child, hover, or current-page rules.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
pnpm run test:e2e -- --grep "uses one compact border line for mobile navigation states"
```

Expected: PASS, including the existing assertion that hover does not change the link's bounding-box height.

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

Use a hidden server so Playwright does not own Windows process teardown:

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

Expected: all browser tests pass, including compact mobile height, divider-state behavior, menu accessibility, and horizontal-overflow coverage. Only the server created by this step is stopped.

- [ ] **Step 7: Review scope, commit, and push**

Update `design-qa.md` after all automated checks pass:

- change the current automated minimum-height statement from `38.4px` to `43.2px`;
- label `docs/superpowers/qa/2026-08-11-mobile-header-navigation.png` as historical evidence captured before the spacing refinement;
- record that the user explicitly chose not to request a new screenshot;
- retain `final result: passed` only when the focused and full browser suites pass;
- do not generate, modify, or delete the existing PNG.

Then review the complete scope.

Run:

```powershell
git diff --check
git status --short --branch
git diff -- src/components/layout/Header.astro tests/e2e/layout.spec.ts design-qa.md
```

Confirm that exactly the three planned files changed: the approved height value, its matching test expectation, and the truthful QA evidence text. Then run:

```powershell
git add src/components/layout/Header.astro tests/e2e/layout.spec.ts design-qa.md
git commit -m "fix: refine mobile header navigation spacing"
git push origin codex/site-foundation
git status --short --branch
```

Expected: the commit and push succeed; the worktree is clean and `codex/site-foundation` is synchronized with `origin/codex/site-foundation`. Keep the worktree and branch, do not merge to `main`, do not create a PR, and stop without starting another task.
