# Support Page Design QA

**Result:** blocked

## Completed checks

- The page uses the existing shared Header, Footer, breadcrumbs, design tokens, and typography stack.
- The service order is 方案设计, 交付培训, 项目施工.
- All three service bodies match the supplied latest Word documents.
- The three supplied annotation images were edited with the built-in image tool; red notes, black arrows, old titles, and old descriptions were removed while the blue icons and light gray backgrounds were preserved.
- Exact Chinese titles and approved summaries are rendered as responsive HTML rather than generated image text.
- The desktop layout alternates visual and body panels; narrow screens use an image-first single column.
- The six legacy child routes are no longer generated.
- Footer support links resolve to the three new section anchors.
- `astro check` completes with 0 errors, 0 warnings, and 0 hints.
- Astro generates `/support/index.html` successfully before the full-site build reaches an unrelated pre-existing ICT product-feature error.
- `/support/` and all three Support image resources return HTTP 200 from the local preview.

## Blocking condition

The user explicitly chose to perform final visual testing and requested no test design or test implementation. The available Codex Desktop browser surface can open the local page but does not expose screenshot capture for a same-viewport comparison with the supplied reference, so automated visual QA is not claimed as passed.

## Remaining review

- User review of desktop spacing, alternating card proportions, and visual copy placement.
- User review of mobile stacking and text readability.
- Apply any requested visual adjustments, then change the result to `passed`.

## Compact-layout iteration

- The hero now follows the product-category title rhythm: 1.5rem top padding, 1.75rem breadcrumb-to-title spacing, a `clamp(2rem, 3.2vw, 2.75rem)` title, and a compact 0.85rem title-to-description gap.
- The English eyebrow was removed so the first service enters the initial desktop viewport sooner.
- Service cards now target a 19rem–23rem desktop minimum height instead of 25rem–34rem.
- Visual panels and overlay copy use tighter minimum heights, padding, and type scale; mobile visual panels use a compact 16:10 ratio.
- A dark “联系技术支持” CTA now follows the service list and links to `/about/#contact`.
- Post-change `astro check` completes with 0 errors, 0 warnings, and 0 hints. `/support/index.html` regenerates successfully before the unchanged ICT feature-data build blocker.
