# Products Overview Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/products/` the Product Center overview and navigation entry while preserving top-level category and product-detail URLs.

**Architecture:** Keep the existing `/[category]/` and `/[category]/[product]/` route files unchanged. Treat `/products/` as the logical parent in navigation and breadcrumbs by explicitly linking it from Header, Footer, category pages, and product pages.

**Tech Stack:** Astro 6, TypeScript, Vitest, Playwright

## Global Constraints

- Preserve `/{category-slug}/` and `/{category-slug}/{product-slug}/`.
- Do not introduce `/products/{category-slug}/` routes or redirects.
- Header Product Center must link to `/products/`.
- Footer Product Center title must link to `/products/`; its four detail links must continue to point directly to top-level category routes.
- Category breadcrumbs must be `Home > Product Center > Category`.
- Product breadcrumbs must be `Home > Product Center > Category > Product`.
- Do not modify or stage in-progress product JSON or image assets.

---

### Task 1: Lock navigation and breadcrumb behavior with tests

**Files:**
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- Consumes: rendered Header, Footer, and BaseLayout breadcrumbs
- Produces: regression coverage for the approved information architecture

- [ ] **Step 1: Update Header expectation**

Change the expected Product Center destination from `/two-way-radio/` to `/products/`.

- [ ] **Step 2: Add Footer title and category-link assertions**

Assert that the Footer Product Center title links to `/products/`, while the four category links target `/two-way-radio/`, `/shortwave-radio/`, `/mesh-network/`, and `/ict-integration/`.

- [ ] **Step 3: Add category and product breadcrumb assertions**

Assert that category and detail pages include a Product Center breadcrumb linked to `/products/`, without changing their canonical URLs.

- [ ] **Step 4: Run the focused tests and verify RED**

Run `pnpm exec playwright test tests/e2e/layout.spec.ts tests/e2e/product-routes.spec.ts`. Expected: failures for the old Header/Footer links and missing Product Center breadcrumb.

### Task 2: Implement the approved navigation hierarchy

**Files:**
- Modify: `src/components/layout/Header.astro`
- Modify: `src/components/layout/Footer.astro`
- Modify: `src/pages/[category]/index.astro`
- Modify: `src/pages/[category]/[product].astro`

**Interfaces:**
- Consumes: existing category collection and explicit `BreadcrumbItem[]`
- Produces: Product Center overview links and logical breadcrumb ancestry

- [ ] **Step 1: Update Header**

Set Product Center to `/products/` and include both the overview and top-level category prefixes in its active-state calculation.

- [ ] **Step 2: Update Footer**

Set the Product Center group's `titleHref` to `/products/`; retain category detail links unchanged.

- [ ] **Step 3: Update category breadcrumbs**

Prepend `{ label: '产品中心', href: '/products/' }` before the category item.

- [ ] **Step 4: Update product breadcrumbs**

Prepend `{ label: '产品中心', href: '/products/' }` before the category and product items.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run `pnpm exec playwright test tests/e2e/layout.spec.ts tests/e2e/product-routes.spec.ts`. Expected: all focused tests pass.

### Task 3: Synchronize architecture documentation

**Files:**
- Modify: `SiteMap.md`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: implemented route and navigation behavior
- Produces: unambiguous documentation for future product-page work

- [ ] **Step 1: Update navigation documentation**

Document `/products/` as the Product Center overview and Header/Footer title destination.

- [ ] **Step 2: Preserve route constraints**

Document that categories and products remain at top-level URLs and breadcrumbs use a logical Product Center parent.

- [ ] **Step 3: Remove obsolete temporary-page wording**

Remove statements saying `/products/` is not a navigation entry or that Product Center links directly to the first category.

### Task 4: Verify the integrated result

**Files:**
- Verify only; do not stage unrelated product content

**Interfaces:**
- Consumes: Tasks 1–3
- Produces: evidence that navigation, routes, accessibility, and build remain valid

- [ ] **Step 1: Run content validation**

Run `pnpm run validate:content`.

- [ ] **Step 2: Run unit tests**

Run `pnpm run test:unit`.

- [ ] **Step 3: Run Astro check and build**

Run with `ASTRO_TELEMETRY_DISABLED=1`: `pnpm run build`.

- [ ] **Step 4: Run the full browser suite**

Run `pnpm run test:e2e`.

- [ ] **Step 5: Review the scoped diff**

Confirm only navigation, breadcrumb, documentation, plan, and associated tests changed in this task.
