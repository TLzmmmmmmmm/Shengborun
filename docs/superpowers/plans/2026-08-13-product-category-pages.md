# Product Category Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four category placeholders with responsive category pages that share navigation and banner components, list every published JSON product, and preserve the independent homepage and `/products/` presentations.

**Architecture:** Introduce a JSON-only product content loader that ignores zero-byte draft files, and keep category presentation data sourced from the category collection. Compose each category page from focused `CategoryNavigation`, `CategoryBanner`, and extended `ProductCard` units; keep the grid local to the route and leave `CategorySection` responsible for homepage composition.

**Tech Stack:** Astro 6 content collections, TypeScript, Astro components and scoped CSS, Vitest, Playwright.

## Global Constraints

- Category routes remain `/{category-slug}/`; product routes remain `/{category-slug}/{product-slug}/`.
- Category order and descriptions come from `src/content/product-categories/*.json` and match `/products/`.
- Desktop category navigation shows four items; 390 px mobile keeps four items in one row; very narrow screens switch to 2 × 2; horizontal scrolling is forbidden.
- The active navigation item uses a teal icon circle, teal label, and a centered underline approximately half the label width.
- Original `public/images/products/*-banner.png` assets remain unchanged and are used at `5 / 2` desktop and `16 / 7` mobile.
- Desktop product cards remain square in a three-column grid; mobile cards are rectangular with image left and content right.
- Every product card is a single full-card link and displays at most two plain-text key features.
- Category pages display all published products ordered by `sortOrder`, then `id`; they do not paginate.
- Zero-byte JSON files are retained as drafts, are not populated, and are skipped by loading and validation.
- Delete the three obsolete Markdown sample products and do not retain Markdown/MDX product loading.
- Do not create a `ProductGrid` component or add category-page modes to `CategorySection`.

---

### Task 1: JSON-only product content migration

**Files:**
- Create: `src/lib/json-product-loader.ts`
- Modify: `src/content.config.ts`
- Modify: `src/lib/content-rules.ts`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/unit/content-schema.test.ts`
- Delete: `src/content/products/ly198.md`
- Delete: `src/content/products/sample-radio.md`
- Delete: `src/content/products/product-sample-03.md`

**Interfaces:**
- Produces: `jsonProductLoader({ base: string }): Loader`, which recursively loads non-empty `.json` files, calls `context.parseData`, and stores each record under its data `id`.
- Produces: `productSchema` with `keyFeatures: string[]`.
- Consumes: zero-byte JSON files as intentional drafts and skips them without parsing.

- [x] **Step 1: Write failing loader and schema tests**

Add tests that prove: string feature arrays parse; object feature arrays fail; recursive JSON validation catches unknown categories; zero-byte JSON drafts are ignored; Markdown files no longer affect validation.

```ts
expect(productSchema.safeParse({
  id: 'ly198', name: '润信达 LY198', slug: 'ly198',
  categoryId: 'two-way-radio', coverImage: '/images/ly198.png',
  keyFeatures: ['一键对频', '小巧轻薄'], published: true,
}).success).toBe(true);
```

- [x] **Step 2: Run the focused unit test and verify RED**

Run:

```powershell
pnpm run test:unit -- tests/unit/content-schema.test.ts
```

Expected: failure because the schema expects `{ label, color }` features and validation still reads Markdown products.

- [x] **Step 3: Implement the JSON loader and content rules**

Use a focused loader with this contract:

```ts
export function jsonProductLoader({ base }: { base: string }): Loader;
```

Its `load` method clears the collection store, recursively reads `.json`, skips files whose trimmed text is empty, parses JSON objects, validates via `parseData`, and stores `{ id: data.id, data, filePath, digest }`. Update `content.config.ts` to use it. Change product `keyFeatures` to `z.array(z.string().min(1)).default([])`, remove feature-color cross-product validation, and make `validate-content.mjs` read non-empty product JSON files.

- [x] **Step 4: Delete the three Markdown samples**

Delete exactly the three approved sample files and no JSON product file.

- [x] **Step 5: Run focused tests and content validation**

Run:

```powershell
pnpm run test:unit -- tests/unit/content-schema.test.ts
pnpm run validate:content
```

Expected: all focused tests pass and output includes `Content references are valid.`

---

### Task 2: Canonical category presentation data

**Files:**
- Modify: `src/content/product-categories/two-way-radio.json`
- Modify: `src/content/product-categories/shortwave-radio.json`
- Modify: `src/content/product-categories/mesh-network.json`
- Modify: `src/content/product-categories/ict-integration.json`
- Modify: `src/data/product-category-overview.ts`
- Modify: `src/data/products-page-placeholders.ts`
- Modify: `tests/unit/page-boundaries.test.ts`

**Interfaces:**
- Produces: the four approved `shortDescription` values as canonical content.
- Consumes: the same content in `/products/` and homepage presentation without competing hard-coded descriptions.

- [x] **Step 1: Write a failing consistency test**

Read the four category JSON files and assert their ordered descriptions equal the approved literal list. Assert `/products/` overview data derives category names/descriptions from category content rather than redefining those strings.

- [x] **Step 2: Run the focused unit test and verify RED**

Run:

```powershell
pnpm run test:unit -- tests/unit/page-boundaries.test.ts
```

Expected: failure because the category JSON descriptions are still the older copy.

- [x] **Step 3: Update canonical descriptions and consumers**

Set the four exact descriptions from the design. Refactor overview and homepage fallback data so descriptions are supplied from category collection records at runtime; keep only visual fallback assets in `products-page-placeholders.ts`.

- [x] **Step 4: Run the focused unit test and verify GREEN**

Run:

```powershell
pnpm run test:unit -- tests/unit/page-boundaries.test.ts
```

Expected: pass.

---

### Task 3: Category navigation and banner components

**Files:**
- Create: `src/components/products/CategoryNavigation.astro`
- Create: `src/components/products/CategoryBanner.astro`
- Create: `src/data/category-visuals.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- `CategoryNavigation` consumes `categories: Array<{ id; name; slug; sortOrder }>` and `currentCategoryId: string`.
- `CategoryBanner` consumes `src`, `alt`, and `objectPosition`.
- `categoryVisuals` maps category ID to icon name, banner path, alt text, and focal position.

- [x] **Step 1: Replace the placeholder category browser test with failing navigation/banner assertions**

Assert four ordered links, correct root URLs, one `aria-current="page"`, four icon circles, original banner `src`, and semantic navigation label. At 390 px assert one row; at 320 px assert 2 × 2 and no horizontal overflow.

- [x] **Step 2: Run the focused browser test and verify RED**

Run:

```powershell
node node_modules/@playwright/test/cli.js test tests/e2e/product-routes.spec.ts
```

Expected: failure because the category route is still a placeholder.

- [x] **Step 3: Implement the focused components**

Use an icon library already available to the project; if none exists, add one small package rather than handcrafted SVG. Render simple radio, radio tower, network nodes, and server icons. Implement the active underline as a centered pseudo-element sized in `em`, not a full item border. Implement `5 / 2` desktop and `16 / 7` mobile Banner ratios with `object-fit: cover`.

- [x] **Step 4: Run the focused browser test**

Expected: component-level navigation and banner assertions pass once composed in Task 5; until then keep the test changes ready and proceed without weakening expectations.

---

### Task 4: Full-card responsive ProductCard

**Files:**
- Modify: `src/components/products/ProductCard.astro`
- Modify: `src/components/products/CategorySection.astro`
- Modify: `tests/e2e/products.spec.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- `ProductCard` consumes `{ name, image, imageAlt, href, featureSummary?: string[] }`.
- Homepage callers omit `featureSummary` and retain their current visual output.
- Category callers pass at most two feature strings.

- [x] **Step 1: Write failing full-card and responsive tests**

Assert each card has one anchor only, the anchor is the outer card, category summaries contain at most two features, desktop card ratio is square, and mobile layout has media left/content right.

- [x] **Step 2: Run tests and verify RED**

Run the products and product-routes browser specs. Expected: failure because the current card contains a nested CTA link and remains vertically square on mobile.

- [x] **Step 3: Implement the minimal ProductCard refactor**

Make the root element an `<a>`, render `查看详情 →` as a non-link span, and render the optional feature summary only when provided. Preserve the desktop square appearance. At the mobile breakpoint use a two-column grid close to `38% 62%`, remove the square aspect ratio, and constrain summary text to two visual lines.

- [x] **Step 4: Preserve homepage output**

Update `CategorySection` only as needed for the new `ProductCard` markup. Verify its banner, three-card selection, and overall layout remain unchanged.

- [x] **Step 5: Run focused browser tests and verify GREEN**

Run both specs; expected: all assertions pass after Task 5 composition.

---

### Task 5: Compose complete category pages

**Files:**
- Modify: `src/pages/[category]/index.astro`
- Modify: `src/lib/products.ts`
- Modify: `tests/unit/products.test.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- Produces: `selectAllPublishedProducts(products, categoryId)` sorted by `sortOrder`, then `id`.
- Consumes: category collection, product collection, `CategoryNavigation`, `CategoryBanner`, `ProductCard`, and `categoryVisuals`.

- [x] **Step 1: Write a failing all-products selector test**

Use a fixture containing published, unpublished, wrong-category, tied-order, and empty-feature products. Assert no display limit and deterministic order.

- [x] **Step 2: Run the unit test and verify RED**

Expected: failure because only the limited selector exists.

- [x] **Step 3: Add the all-products selector**

Implement:

```ts
export function selectAllPublishedProducts<T extends ProductSummary>(
  products: readonly T[],
  categoryId: string,
): T[];
```

- [x] **Step 4: Replace the route placeholder**

Compose the approved sequence: Breadcrumb, title/description, large spacing, Category Navigation, Banner, `产品系列`, local product grid or `产品资料整理中`. Derive summaries from the first two non-empty feature strings and product URLs from unchanged root category routes.

- [x] **Step 5: Run unit and browser tests**

Expected: four category routes render; published counts/order, empty state, breadcrumbs, navigation, banner, cards, and responsive behavior pass.

---

### Task 6: Visual QA and complete regression verification

**Files:**
- Modify: `design-qa.md`
- Create: `docs/design-previews/product-category-pages/category-desktop-1440x900.png`
- Create: `docs/design-previews/product-category-pages/category-mobile-390x844.png`
- Create: `docs/design-previews/product-category-pages/category-narrow-320x800.png`

**Interfaces:**
- Consumes: local `/two-way-radio/` implementation and the approved desktop/mobile mockups.
- Produces: browser-rendered evidence and final QA status.

- [x] **Step 1: Run the complete suite**

Run:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'; pnpm run test
```

Expected: unit tests, content validation, Astro check/build, and all Playwright tests pass with zero failures.

- [x] **Step 2: Capture the three calibrated viewports**

Capture desktop, standard mobile, and narrow mobile. Verify browser console has no errors and all primary links navigate correctly.

- [x] **Step 3: Compare against the approved visual targets**

Check breadcrumb hierarchy, title spacing, navigation icon/underline proportions, banner crops, desktop three-card geometry, mobile left/right cards, image quality, typography, colors, and copy. Fix any P0/P1/P2 mismatch and recapture at the same viewport.

- [x] **Step 4: Record final QA**

Update `design-qa.md` with source paths, implementation screenshots, viewport/density data, interaction checks, findings, iteration history, and exactly `final result: passed` only when no actionable P0/P1/P2 issue remains.

- [x] **Step 5: Review final diff scope**

Confirm the diff deletes only the three approved Markdown files, preserves every existing banner and JSON product file, does not add `ProductGrid`, and does not alter product-detail page design.
