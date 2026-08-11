# Shengborun Visual QA

**Findings**

- [P3, out-of-scope follow-up] Local development capture requests a missing favicon.
  Location: local Astro development response for `/favicon.ico`.
  Evidence: the required Chrome capture emitted `Failed to load resource: the server responded with a status of 404 (Not Found)` for `http://127.0.0.1:4321/favicon.ico`.
  Impact: this is not caused by the scoped Header change and does not affect the Header interaction or divider-state evidence. The user explicitly approved recording it as a separate follow-up rather than blocking this Header QA result.
  Fix: resolve the pre-existing favicon response in a separately approved task, then optionally recapture to obtain a console-clean development screenshot.

**Evidence**

- Source visual truth: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-9b4a10cb-7cb7-4026-b020-a7df43430cb7.png`
- Historical implementation screenshot (captured before the spacing refinement): `D:\Shengborun\.worktrees\site-foundation\docs\superpowers\qa\2026-08-11-mobile-header-navigation.png`
- Screenshot decision: the user explicitly chose not to request a new screenshot for this spacing refinement.
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

The focused navigation region confirms the intended state model: the old desktop pseudo-element is not displayed on mobile, each row has a stable 1px border, and the last inactive row does not show a bottom divider. The automated regression verifies `min-height: 43.2px` (10% tighter than 48px), exact teal/gray/transparent colors, hover stability, and final-row current behavior. Typography, copy, and existing Header tokens remain component-owned and unchanged; no raster, vector, icon, or generated image asset is involved.

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

## Mobile Footer Detail Density QA

**Evidence**

- Source visual truth: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-880c456e-68a4-4d97-8cf6-14a1d436ff94.png` (`648 × 347px`).
- Implementation screenshot: `C:\Users\Lenovo\AppData\Local\Temp\shengborun-mobile-footer-detail-density.png` (`647 × 316px`).
- Same-input comparison evidence: `C:\Users\Lenovo\AppData\Local\Temp\shengborun-mobile-footer-detail-density-comparison.png`; the source and implementation were opened together before this result was recorded.
- Route: `/`; CSS viewport: `647 × 900`; device scale factor: `1`; state: first two Footer detail groups open.
- Density normalization: none. Both captures use one-device-pixel-per-CSS-pixel; the source is one pixel wider and naturally taller because it represents the pre-compaction link rhythm.

**Computed And Interaction Checks**

- Passed: expanded child links compute to `14px` font size and `36px` minimum height; child-list row gap computes to `9.36px`.
- Preserved: Footer section titles compute to `16px` with `16px` block padding; child-list bottom padding remains `17.6px`.
- Pointer and keyboard: a summary opens by pointer, closes with `Enter`, and reopens with `Space` in the focused browser regression.
- Desktop preservation: at `768px`, the open state remains, child-list gap is `10.4px`, and child links retain their `16px` font size.
- Overflow: the full browser suite passed its mobile through ultra-wide horizontal-overflow coverage.
- Console: the capture emitted only the known `/favicon.ico` 404; it remains the accepted, out-of-scope P3 follow-up recorded above. No page runtime error was observed.

**Visual Comparison**

The same expanded Footer state shows a stronger title/link hierarchy through smaller child text and approximately 10% tighter link rhythm. The title typography and padding, muted link color, teal controls, and gray dividers remain stable. The following title moves upward naturally with the denser child rows. No actionable P0, P1, or P2 difference was found in the scoped mobile Footer detail hierarchy.

**Focused Region Decision**

The two expanded detail groups are the focused region because the acceptance criteria are link typography, row rhythm, title metrics, dividers, and the next-title movement; no additional asset-focused region is needed because this Footer surface contains no image assets.

final result: passed
