# Design QA — Product Overview and Category Pages

## Evidence

- Source visual truth:
  - `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-71b051ac-32e7-4a24-bcdb-81a4bd1b6519.png` (desktop reference board)
  - `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-5ffeaa32-8d76-4d31-93fe-a3d005486af2.png` (mobile reference board)
- Implementation screenshots:
  - `docs/design-previews/product-category-pages/category-desktop-1440x900.png` — 1440 × 900 CSS px, device scale factor 1, 1440 × 900 PNG
  - `docs/design-previews/product-category-pages/category-mobile-390x844.png` — 390 × 844 CSS px, device scale factor 1, 390 × 844 PNG
  - `docs/design-previews/product-category-pages/category-narrow-320x800.png` — 320 × 800 CSS px, device scale factor 1, 320 × 800 PNG
- State: default `/two-way-radio/` page, current category active, no menus open.
- Density normalization: all implementation captures are 1× CSS pixel density. Reference boards include explanatory canvas and device framing, so comparison used the app-owned content region and approved follow-up decisions rather than the surrounding annotation canvas.

## Full-view comparison

- Desktop hierarchy matches the revised order: weak breadcrumb, centered title/description, four-item enlarged category navigation, 3:1 banner, and three-column cards with no intervening section heading.
- At 390 px the four categories remain in one row without horizontal scrolling, with circles and glyphs enlarged by 50% from the earlier mobile design.
- At 320 px the navigation falls back to 2 × 2; the banner remains 3:1 and product cards retain the left-image/right-content layout.
- The original category banner remains in use; the new category-card crops are not substituted here.

## Focused comparison

- Navigation: desktop circles and glyphs are twice their earlier size; mobile circles and glyphs are 1.5 times their earlier size. The active item uses teal and a centered underline approximately half the label width.
- Product cards: desktop cards are square; mobile cards are horizontal with approximately 38% media and 62% content. Each card is one link with a visible CTA and up to two feature strings.
- Focused regions were readable in the full-resolution captures, so separate crops were unnecessary.

## Required fidelity surfaces

- Fonts and typography: existing site font stack and heading weights are preserved; title, category labels, and CTA hierarchy match the established site system.
- Spacing and layout rhythm: `/products/` and category pages use the homepage's 100rem content width; category navigation is deliberately separated from the centered title block; cards follow the banner directly with a normal section gap.
- Colors and tokens: existing graphite, muted background, divider, and teal brand tokens are reused; active state contrast is clear.
- Image quality and asset fidelity: original high-resolution category banners and formal product images are used with cover/contain behavior appropriate to their slots.
- Copy and content: canonical category descriptions are sourced from category content; the removed product-series paragraph does not appear.

## Comparison history

1. Initial implementation used a narrower 90rem container, left-aligned mobile overview copy, smaller navigation icons, 5:2/16:7 banners, and a visible “产品系列” heading.
2. Revision: both page types now use the homepage's 100rem container; titles and descriptions are centered; icons are enlarged 100% desktop and 50% mobile; banners are 3:1; the section heading is removed.
3. Post-fix evidence: all category screenshots above plus `docs/design-previews/products-overview/products-1366x768.png` and `products-390x844.png`. Automated width, alignment, geometry, ratio, and heading-absence checks pass.
4. The mobile reference board shows 2 × 2 navigation and product-series description, but later approved requirements supersede both at 390 px: navigation remains one row and the description/title is removed. These are intentional differences, not defects.

## Findings

- No actionable P0, P1, or P2 visual mismatches remain.
- P3 follow-up: after more products are populated, recheck very long model names in the mobile content column.

## Interaction and accessibility checks

- Four category navigation destinations and full-card product links are covered by browser tests.
- Active category exposes `aria-current="page"`.
- The page has no horizontal overflow at 390 px or 320 px.
- Browser console errors are asserted during representative category and product navigation.

## Implementation checklist

- [x] 3:1 category banner crop on every breakpoint
- [x] Homepage-equivalent 100rem page width
- [x] Centered titles and descriptions
- [x] Desktop icons enlarged 100%; mobile icons enlarged 50%
- [x] Four navigation items at 390 px; 2 × 2 at 320 px
- [x] Half-label active underline
- [x] Desktop three-column square cards
- [x] Mobile left-image/right-content cards
- [x] Single full-card links with two-feature maximum
- [x] Original category banners preserved
- [x] “产品系列” heading removed

## Latest responsive-detail verification

- Added a 1024 x 900 desktop capture at `docs/design-previews/product-category-pages/category-desktop-1024x900.png` to verify the intermediate desktop state.
- Desktop category circles now scale with the viewport via `clamp(6rem, 10vw, 12rem)`; glyphs scale proportionally at half the circle size.
- Desktop product-card spacing scales down without clipping key features. The CTA region measures 30%-37% of the complete card width at the tested desktop breakpoint.
- Mobile CTA and key-feature text both render at 0.9rem; feature labels use the middle-dot separator.
- Mobile breadcrumbs render at 14px, matching footer-detail hierarchy.
- Footer accordion panels now honor the `hidden` state and respond to click, Enter, and Space interactions.
- Verification: 20 unit tests, content validation, Astro diagnostics, 29-page production build, and 36 browser tests all pass.

## Desktop proportional-scaling correction

- Source visual truth:
  - `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-69472a92-4aa2-4b57-abee-7f850ceffa2f.png` (desktop card clipping and oversized CTA evidence)
  - `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-cd2ec7d2-089e-41a9-aa72-29dc32d3f0ee.png` (desktop navigation proportion target)
- Rendered evidence:
  - `docs/design-previews/product-category-pages/category-desktop-1440x900.png` (1440 x 900 CSS px, device scale factor 1)
  - `docs/design-previews/product-category-pages/category-desktop-1024x900.png` (1024px-wide full-page capture, device scale factor 1)
  - `docs/design-previews/product-category-pages/category-mobile-390x844.png` (390 x 844 CSS px, device scale factor 1)
- Earlier P2 findings: feature text progressively clipped as the desktop card narrowed; CTA inherited a larger body size; navigation rings and glyphs used independent viewport clamps, so their proportions and scaling diverged.
- Fixes: feature text now wraps without flex shrinking or horizontal clipping; desktop CTA uses the same 0.9rem size as feature text; each ring occupies 72% of its navigation column and each glyph occupies 48% of its ring, so both layers scale together.
- Post-fix evidence: browser assertions cover 800, 900, 1024, 1200, and 1440px desktop widths. Complete feature content remains inside the card, CTA and feature sizes match, ring size follows column width, and glyph-to-ring ratio remains stable. The 390px mobile rules remain unchanged.
- Focused comparison: the navigation region and complete product-card rows are readable in the 1024px full-page capture; no additional crops are required.
- Findings: no actionable P0, P1, or P2 mismatch remains for the reported desktop issues.

## Product detail page — Task 5 visual QA

### Evidence

- Source visual truth: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-b5ebcb15-76a6-493e-9efd-e159f5dadbb1.png` — 1024 × 1535 PNG.
- Desktop implementation: `docs/design-previews/product-detail/product-detail-desktop-1440x900.png` — 1440 × 2012 full-page PNG from a 1440 × 900 CSS viewport, device scale factor 1.
- Mobile implementation: `docs/design-previews/product-detail/product-detail-mobile-390x844.png` — 390 × 1746 full-page PNG from a 390 × 844 CSS viewport, device scale factor 1.
- Density normalization: all implementation evidence is captured at 1× CSS density. The 1024 px source is a narrower desktop reference, so the comparison normalizes by page-owned regions and responsive intent rather than treating its pixel width as the 1440 px implementation viewport.
- State: default `/two-way-radio/ly198/` product detail route; first parameter group selected; desktop navigation visible; mobile menu closed; no hover or focus state forced.

### Full-view comparison

- The implementation retains the source hierarchy and rhythm: compact Header, breadcrumbs, left product image/right product information, four lightweight Feature icons, technical parameters, centered teal CTA, and Footer.
- Desktop keeps the overview balanced at 48%/52%, the cover image contained and uncropped, and the CTA centered between the parameter content and Footer.
- Mobile stacks media before information, lays Features out in two columns, merges parameters into one table, keeps the CTA centered, and preserves Header/body/Footer separation without horizontal overflow at 390 px or the checked 320 px minimum.
- The source uses a different LY198 packshot and more bordered surfaces. The implementation intentionally uses the canonical site product asset and existing muted-surface/table tokens; subject, containment, hierarchy, and density remain faithful to the approved non-pixel-replication brief.

### Focused comparison

- Hero: full-resolution evidence confirms a sharp contained cover, readable title/description, balanced two-column desktop placement, and clean stacked mobile wrapping.
- Features: all four Lucide library icons are visible, aligned, consistent in stroke weight, teal, and paired with readable labels; the mobile 2 × 2 grid does not collide or clip.
- Parameters and CTA: row labels/values are legible in both full-resolution captures; desktop tabs have a clear selected treatment, mobile has no group navigation, and the black-on-teal CTA is centered. Separate crops were unnecessary because these regions remain readable at original image resolution.

### Required fidelity surfaces

- Fonts and typography: the site font stack, graphite heading hierarchy, body line height, optical weight, wrapping, and small-label sizing are coherent across desktop and mobile; no truncation or cramped copy is visible.
- Spacing and layout rhythm: breadcrumbs, overview, Features, parameter heading/table, CTA, and Footer use distinct section gaps; desktop and mobile alignments preserve the source reading order.
- Colors and visual tokens: graphite text, secondary gray copy, muted media surface, subtle row dividers, and brand teal icons/CTA use the established site tokens with sufficient visible contrast.
- Image quality and asset fidelity: the canonical LY198 image remains sharp at both captures, uses `contain`, has no gallery control, and shows no stretch, crop, halo, or compression artifact.
- Copy and content: the product name, description, four Feature labels, parameter values, breadcrumbs, and `立即咨询` CTA render as real product content rather than placeholders.

### Comparison history

1. Initial capture finding — P2: the Astro development toolbar appeared in both full-page screenshots, covering part of the desktop parameter area and the mobile `技术参数` heading. This was a capture-only artifact, not a production component.
2. Fix: conditional screenshot capture now hides the `astro-dev-toolbar` host before capture while leaving the product page implementation unchanged.
3. Post-fix evidence: the source, revised desktop screenshot, and revised mobile screenshot were opened together with `view_image`. The obstruction is gone and no actionable P0, P1, or P2 visual mismatch remains.

### Findings and verification limits

- P0: none.
- P1: none.
- P2: none after the capture-artifact fix above.
- P3 follow-up: recheck very long imported parameter labels once the in-progress product content set is finalized.
- Representative capture coverage passes for desktop and mobile, including four library icons, contained cover image, two-column/stacked layouts, 390 px and 320 px overflow checks, and the link-free centered CTA.
- Multi-tab regression is externally blocked by current product data: `envoy-x` now contains one parameter group, while every currently published multi-group product references at least one Feature name missing from the canonical library and therefore cannot render. Per task scope, no product JSON, product image, or Feature-library data was changed.

final result: passed
