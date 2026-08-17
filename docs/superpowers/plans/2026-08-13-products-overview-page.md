# Products Overview Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary `/products/` content with a responsive four-category overview while preserving the homepage product presentation and all existing category banners.

**Architecture:** Keep category-card content in a small typed data module and render it through one reusable, fully clickable Astro card component. `/products/` alone consumes this overview; category routes continue using `CategorySection` and the original `*-banner.png` files.

**Tech Stack:** Astro 6, TypeScript, scoped Astro CSS, Vitest, Playwright.

## Global Constraints

- `/products/` uses the confirmed title, introduction, category order, descriptions, and `category-cards` images.
- Desktop uses a two-column grid calibrated for a 1366×768 lower-bound laptop and a 1440×900 ideal viewport; the second row may peek into the first viewport without compressing the first row.
- Mobile uses one column.
- The whole card is clickable and includes “查看产品 →”.
- Existing category `*-banner.png` assets and `CategorySection` behavior remain unchanged.
- Homepage behavior remains independent from `/products/`.

---

### Task 1: Products overview contract

**Files:**
- Modify: `tests/e2e/products.spec.ts`
- Modify: `tests/unit/page-boundaries.test.ts`

**Interfaces:**
- Consumes: `/products/` route rendered by Astro.
- Produces: observable requirements for content, links, image sources, grid order, full-card links, and responsive behavior.

- [x] Write tests asserting the four confirmed cards and their independent `/products/` presentation.
- [x] Run the focused unit and browser tests and confirm they fail because the overview does not exist yet.

### Task 2: Reusable category overview cards

**Files:**
- Create: `src/data/product-category-overview.ts`
- Create: `src/components/products/CategoryOverviewCard.astro`
- Modify: `src/pages/products/index.astro`

**Interfaces:**
- Produces: `productCategoryOverview`, an ordered array of `{ id, name, description, image, imageAlt, href }`.
- Consumes: each overview item as `CategoryOverviewCard` props.

- [x] Add the minimal typed overview data needed by the failing tests.
- [x] Build a semantic full-card link with a 5:3 image area, title, description, and CTA.
- [x] Replace `/products/` temporary sections with the two-column overview grid and responsive calibrated sizing.
- [x] Run focused tests and confirm they pass.

### Task 3: Visual and regression verification

**Files:**
- Create: `design-qa.md`

**Interfaces:**
- Consumes: the completed local `/products/` page.
- Produces: recorded desktop/mobile visual QA and final verification evidence.

- [x] Run unit tests, Astro build, and Playwright tests.
- [x] Inspect `/products/` at the calibrated desktop and representative mobile viewports.
- [x] Confirm category pages still reference original banners and record the QA result.
