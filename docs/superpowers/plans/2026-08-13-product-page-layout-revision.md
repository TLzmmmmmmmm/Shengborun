# Product Page Layout Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved width, centered heading, enlarged navigation icon, 3:1 banner, and heading-removal revisions to the product overview and category pages.

**Architecture:** Reuse the existing page and component boundaries. Update browser geometry assertions first, then make scoped CSS and markup changes in the overview route, category route, category navigation, and banner components.

**Tech Stack:** Astro 6, scoped CSS, Playwright.

## Global Constraints

- `/products/` and `/{category-slug}/` use `max-width: 100rem`.
- Titles and descriptions are centered on desktop and mobile.
- Desktop navigation icons grow 100%; mobile icons grow 50%.
- 390 px keeps four navigation items in one row; 320 px remains 2 × 2.
- Category banners are 3:1 on every breakpoint.
- “产品系列” is absent and product cards follow the banner.

---

### Task 1: Encode revised geometry and content expectations

**Files:**
- Modify: `tests/e2e/products.spec.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

- [x] **Step 1: Add assertions**

Assert equal overview/homepage content widths at 1440 px, centered overview and category headers, doubled desktop icon circle/glyph sizes, 1.5× mobile sizes, 3:1 banners, no “产品系列” heading, and unchanged 390/320 navigation layouts.

- [x] **Step 2: Run focused tests and verify RED**

Run the two product browser specifications against the existing production build. Expected: failures for width, mobile overview alignment, icon sizes, banner ratio, and the remaining heading.

### Task 2: Apply the minimal layout changes

**Files:**
- Modify: `src/pages/products/index.astro`
- Modify: `src/pages/[category]/index.astro`
- Modify: `src/components/products/CategoryNavigation.astro`
- Modify: `src/components/products/CategoryBanner.astro`

- [x] **Step 1: Update overview and category containers**

Set both page content wrappers to `max-width: 100rem`; keep overview and category headings centered at all breakpoints.

- [x] **Step 2: Enlarge navigation icons**

Use 8rem circle / 3.75rem glyph on desktop and 4.3125rem circle / 2rem glyph on mobile. Preserve the 390 px four-column layout and 320 px 2 × 2 fallback.

- [x] **Step 3: Update banner and remove heading**

Use a 3:1 banner frame at every breakpoint. Remove the `h2` and its `aria-labelledby`, then retain a normal gap between banner and the grid or empty state.

- [x] **Step 4: Rebuild and run focused tests**

Expected: focused browser tests pass.

### Task 3: Visual and regression verification

**Files:**
- Modify: `design-qa.md`
- Replace: `docs/design-previews/product-category-pages/category-desktop-1440x900.png`
- Replace: `docs/design-previews/product-category-pages/category-mobile-390x844.png`
- Replace: `docs/design-previews/product-category-pages/category-narrow-320x800.png`

- [x] **Step 1: Capture the three calibrated viewports**

Confirm the wider container, centered heading, enlarged icons, 3:1 banner, and direct banner-to-card flow.

- [x] **Step 2: Run full verification**

Run unit tests, content validation, Astro check/build, and all Playwright tests using the stable static preview process.

- [x] **Step 3: Record QA**

Update `design-qa.md` and use `final result: passed` only if no P0/P1/P2 issue remains.
