# Mobile Header Navigation Divider QA

**Findings**

- [P3, out-of-scope follow-up] Local development capture requests a missing favicon.
  Location: local Astro development response for `/favicon.ico`.
  Evidence: the required Chrome capture emitted `Failed to load resource: the server responded with a status of 404 (Not Found)` for `http://127.0.0.1:4321/favicon.ico`.
  Impact: this is not caused by the scoped Header change and does not affect the Header interaction or divider-state evidence. The user explicitly approved recording it as a separate follow-up rather than blocking this Header QA result.
  Fix: resolve the pre-existing favicon response in a separately approved task, then optionally recapture to obtain a console-clean development screenshot.

**Evidence**

- Source visual truth: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-9b4a10cb-7cb7-4026-b020-a7df43430cb7.png`
- Implementation screenshot: `D:\Shengborun\.worktrees\site-foundation\docs\superpowers\qa\2026-08-11-mobile-header-navigation.png`
- Source dimensions: `214 × 473px` (measured from the local source file).
- Implementation dimensions: `320 × 700px`.
- Implementation CSS viewport: `320 × 700`; device scale factor: `1`; route: `/`; state: mobile menu open.
- Density normalization: none. The source is a 214px-wide focused navigation crop while the required implementation evidence is a 320px-wide full viewport, so canvas size and visible surrounding content were not treated as visual regressions.

**Primary Interaction Checks**

- Menu open: passed in the focused browser regression and full E2E suite.
- Hover state: passed; inactive rows become teal by border color only and retain their bounding-box height.
- Current state: passed; the active first row and a programmatically selected final row become teal.
- Escape close: passed in `keeps navigation usable and avoids horizontal overflow`.
- Horizontal overflow: passed at 320, 768, 1440, 1920, and 2560px in the full E2E suite.
- Console errors: Chrome emitted a favicon 404 during the required capture run; no page runtime error was observed. Per the user's explicit decision, this pre-existing unrelated response is recorded as a non-blocking, out-of-scope follow-up.

**Full-View Comparison**

The source and implementation screenshots were opened together for comparison. Both depict the real Header navigation content; no image assets are used in the affected mobile-navigation rows. The implementation has one teal border below the active `首页` row, gray borders below inactive middle rows, and a transparent inactive final row. The source is a focused crop without the page header or surrounding page content, whereas the required implementation screenshot includes the complete 320 × 700 viewport; that framing difference is expected from the prescribed evidence sizes.

**Focused Divider And Spacing Comparison**

The focused navigation region confirms the intended state model: the old desktop pseudo-element is not displayed on mobile, each row has a stable 1px border, and the last inactive row does not show a bottom divider. The automated regression verifies `min-height: 38.4px` (20% tighter than 48px), exact teal/gray/transparent colors, hover stability, and final-row current behavior. Typography, copy, and existing Header tokens remain component-owned and unchanged; no raster, vector, icon, or generated image asset is involved.

**Comparison History**

1. Initial capture attempt: implementation screenshot was written, then the console gate observed `/favicon.ico` returning HTTP 404. No mobile-divider visual defect was found.
2. Scope decision: the user explicitly classified the pre-existing favicon response as an out-of-scope follow-up. The Header QA result therefore evaluates the captured Header evidence and automated interaction checks, which have no actionable P0/P1/P2 differences.

**Open Questions**

- The favicon response should be addressed only in a separately approved task; it is not part of this Header change.

**Implementation Checklist**

- [x] Add browser coverage for compact row height, stable single borders, hover/current states, and final-row transparency.
- [x] Apply the mobile-only divider override and the scoped final-row state specificity needed by Astro.
- [x] Run automated verification and browser interaction coverage.
- [x] Record the unrelated favicon 404 as a separately approved follow-up; retain the capture and diagnostic evidence.

**Follow-up Polish**

- Separately resolve `/favicon.ico` for a console-clean local development capture.

final result: passed
