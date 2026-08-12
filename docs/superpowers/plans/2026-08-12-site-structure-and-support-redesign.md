# Site Structure and Support Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate product categories and details to top-level paths, copy the current product presentation to the homepage while preserving `/products/`, replace legacy support content with the approved six-service design, and rebuild the footer around the new information architecture.

**Architecture:** Keep `/` and `/products/` as independent Astro pages that compose the existing product components and a shared data preparation helper, not a shared page template. Generate category and product pages from explicit published content at `src/pages/[category]/...`, centralize six support-service records for both support cards and footer details, and keep footer navigation/link behavior in one accessible component.

**Tech Stack:** Astro 6 static output, TypeScript strict mode, Astro content collections, CSS, `astro-icon` with locally installed Material Design Icons, Vitest, Playwright.

## Global Constraints

- `/` and `/products/` show the same product presentation now but remain independent page files and may diverge later.
- Header “产品中心” links to `/two-way-radio/`; `/products/` remains a temporary page but is absent from header and footer navigation.
- Product category paths are `/{category-slug}/`; product detail paths are `/{category-slug}/{product-slug}/`; no nested `/products/{category-slug}/...` routes or links remain.
- Category and product route generation only uses published content and verifies that every product belongs to its URL category.
- `/support/` and six confirmed service paths use default `BaseLayout` placeholders; the supplied 3 × 2 / 2 × 3 card design is deferred.
- Footer has four navigation groups. Only product-center group title is non-link text; the other titles link to `/solutions/`, `/support/`, and `/about/`.
- Mobile footer title text navigation and row expansion are separate, non-overlapping controls: text only navigates; every non-text area in the row only toggles expansion.
- Footer legal links are outside navigation. Desktop uses one `space-between` row; mobile puts copyright on row one and filings plus legal/privacy links in a centered second group.
- `/solutions/`, `/solutions/{solution-slug}/`, and `/about/` retain their approved routes and responsibilities.
- Do not deploy, access the production domain, invent formal company commitments, or create six support detail pages.

---

### Task 1: Remove the cancelled support content model and formalize all four product categories

**Files:**
- Create: `src/content/product-categories/shortwave-radio.json`
- Create: `src/content/product-categories/mesh-network.json`
- Create: `src/content/product-categories/ict-integration.json`
- Modify: `src/content.config.ts`
- Modify: `src/lib/content-rules.ts`
- Modify: `scripts/validate-content.mjs`
- Delete: `src/content/documents/sample-radio-manual.md`
- Delete: `src/content/faq/questions.json`
- Modify: `tests/unit/content-schema.test.ts`

**Interfaces:**
- Produces: published `productCategories` entries with IDs/slugs `two-way-radio`, `shortwave-radio`, `mesh-network`, `ict-integration` and sort orders 1–4.
- Produces: `validateContentReferences({ categories, products }): string[]` with no document validation and no support-reserved slug rule.

- [ ] **Step 1: Change schema tests to describe the new content boundary**

Remove imports/tests for `RESERVED_SUPPORT_SLUGS`, `documentSchema`, and `faqSchema`. Change all `validateContentReferences` calls to omit `documents`. Add:

```ts
it('accepts category slugs that are independent from legacy support routes', () => {
  expect(
    productCategorySchema.safeParse({
      id: 'shortwave-radio',
      name: '短波通信',
      slug: 'shortwave-radio',
      sortOrder: 2,
      published: true,
    }).success,
  ).toBe(true);
});
```

- [ ] **Step 2: Run the focused unit test and verify failure**

Run: `pnpm vitest run tests/unit/content-schema.test.ts`

Expected: FAIL because legacy exports and document arguments still exist.

- [ ] **Step 3: Remove legacy schemas, references, loaders, and validation input**

Delete `documentSchema`, `faqSchema`, `RESERVED_SUPPORT_SLUGS`, the product-category reserved-slug refinement, the `documents` property, and document/product cross-reference checks from `src/lib/content-rules.ts`. Remove `documents` and `faq` collections from `src/content.config.ts`. Update the validator to read only categories and products:

```js
const [categories, products] = await Promise.all([
  readJsonDirectory('product-categories'),
  readMarkdownDirectory('products'),
]);
const errors = validateContentReferences({ categories, products });
```

Delete the cancelled example content files.

- [ ] **Step 4: Add the three missing formal category records**

Use the same strict shape as `two-way-radio.json`:

```json
{
  "id": "shortwave-radio",
  "name": "短波通信",
  "slug": "shortwave-radio",
  "shortDescription": "面向远距离与复杂环境的短波通信设备",
  "sortOrder": 2,
  "published": true
}
```

Create equivalent records for `mesh-network` / “自组网通信” / sort 3 and `ict-integration` / “ICT 集成” / sort 4, using the current approved placeholder descriptions.

- [ ] **Step 5: Run schema and content validation**

Run: `pnpm vitest run tests/unit/content-schema.test.ts && pnpm run validate:content`

Expected: PASS and `Content references are valid.`

- [ ] **Step 6: Commit the content-model migration**

```powershell
git add src/content.config.ts src/lib/content-rules.ts scripts/validate-content.mjs src/content/product-categories tests/unit/content-schema.test.ts
git add -u src/content/documents src/content/faq
git commit -m "refactor: align content model with new site structure"
```

---

### Task 2: Centralize current product-presentation data and keep the homepage independent

**Files:**
- Create: `src/lib/product-presentation.ts`
- Modify: `src/data/products-page-placeholders.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/products/index.astro`
- Create: `tests/unit/page-boundaries.test.ts`
- Modify: `tests/e2e/products.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `getProductPresentation(): Promise<ProductsPageCategory[]>` returning four sorted categories with top-level `href` values and up to three cards each.
- Consumes: `selectPublishedProducts`, formal category collection, and current placeholder banner/card asset metadata.

- [ ] **Step 1: Add failing tests for both independent pages and new links**

Parameterize the landing-page tests across `['/', '/products/']`, assert each page has four `[data-category-section]` nodes, and update expected links:

```ts
const expectedSections = [
  ['two-way-radio', '/two-way-radio/'],
  ['shortwave-radio', '/shortwave-radio/'],
  ['mesh-network', '/mesh-network/'],
  ['ict-integration', '/ict-integration/'],
] as const;
```

Assert the LY198 card uses `/two-way-radio/ly198/`. In `tests/unit/page-boundaries.test.ts`, read both page sources and assert `index.astro` does not import `pages/products/index.astro` and the product page does not import the homepage.

- [ ] **Step 2: Run the focused E2E test and verify failure**

Run: `pnpm vitest run tests/unit/page-boundaries.test.ts && pnpm playwright test tests/e2e/products.spec.ts`

Expected: FAIL because `/` is still the foundation placeholder and links retain `/products/` prefixes.

- [ ] **Step 3: Implement the presentation helper**

Export the existing `ProductsPageCategory` type and asset metadata from `products-page-placeholders.ts`, but derive formal names, order, and category links from content records. `getProductPresentation()` must:

```ts
const [categories, products] = await Promise.all([
  getCollection('productCategories', ({ data }) => data.published),
  getCollection('products', ({ data }) => data.published),
]);
```

Sort categories by `sortOrder`; map published real products when available; use the current three card previews for categories without products; and normalize every category/card `href` to the top-level route.

- [ ] **Step 4: Compose the product presentation independently in both pages**

In both page files call `await getProductPresentation()` and render their own `BaseLayout`, intro, category loop, and page-local canonical metadata. Homepage uses `canonicalPath="/"`; temporary product page uses `canonicalPath="/products/"`. Do not create or import an entire `ProductsLanding` page component.

- [ ] **Step 5: Run product and smoke tests**

Run: `pnpm vitest run tests/unit/page-boundaries.test.ts && pnpm playwright test tests/e2e/products.spec.ts tests/e2e/smoke.spec.ts`

Expected: PASS for both paths and all new links.

- [ ] **Step 6: Commit the independent-page migration**

```powershell
git add src/lib/product-presentation.ts src/data/products-page-placeholders.ts src/pages/index.astro src/pages/products/index.astro tests/unit/page-boundaries.test.ts tests/e2e/products.spec.ts tests/e2e/smoke.spec.ts
git commit -m "feat: place product presentation on homepage"
```

---

### Task 3: Generate top-level category and product-detail placeholder routes

**Files:**
- Create: `src/pages/[category]/index.astro`
- Create: `src/pages/[category]/[product].astro`
- Modify: `src/lib/products.ts`
- Create: `tests/unit/product-routes.test.ts`
- Create: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- Produces: `buildPublishedProductRoutes(categories, products)` returning validated category/detail route records.
- Produces: default `BaseLayout` placeholders with valid metadata and no category/detail feature UI.

- [ ] **Step 1: Write failing route-helper tests**

Cover sorted published categories, published products, unpublished exclusion, and mismatched category exclusion:

```ts
expect(result.details).toEqual([
  { categorySlug: 'two-way-radio', productSlug: 'ly198' },
]);
expect(result.details).not.toContainEqual({
  categorySlug: 'shortwave-radio',
  productSlug: 'ly198',
});
```

- [ ] **Step 2: Run unit tests and verify failure**

Run: `pnpm vitest run tests/unit/product-routes.test.ts`

Expected: FAIL because `buildPublishedProductRoutes` does not exist.

- [ ] **Step 3: Implement route selection and static paths**

Add typed route selection to `src/lib/products.ts`. Both Astro route files use `getStaticPaths()` and only return explicit published category slugs, so reserved top-level pages are never captured accidentally. The category path passes one category plus all sorted categories. The detail path passes the validated product and owning category.

- [ ] **Step 4: Build the category placeholder template**

Render only `BaseLayout` with the category name in the title, `/${category.slug}/` canonical, and one breadcrumb. Use the existing neutral foundation placeholder treatment for a short “页面将在后续阶段完成” message. Do not add category switchers, filters, product lists, or new visual page sections.

- [ ] **Step 5: Build the product-detail placeholder template**

Render only `BaseLayout` with the product name in the title, `/${category.slug}/${product.slug}/` canonical, category and product breadcrumbs, and the same neutral placeholder treatment. Do not render product images, tags, features, parameters, documents, or contact actions.

- [ ] **Step 6: Add E2E route assertions**

Verify `/two-way-radio/` and `/two-way-radio/ly198/` return 200 with the correct placeholder headings and canonicals; generated page links omit `/products`; no category switcher/product-detail UI is present; and build output lacks `dist/products/two-way-radio/index.html`.

- [ ] **Step 7: Run route tests and build**

Run: `pnpm vitest run tests/unit/product-routes.test.ts && pnpm run build && pnpm playwright test tests/e2e/product-routes.spec.ts`

Expected: PASS; only new category/detail paths are generated.

- [ ] **Step 8: Commit product routes**

```powershell
git add src/pages/[category] src/lib/products.ts tests/unit/product-routes.test.ts tests/e2e/product-routes.spec.ts
git commit -m "feat: add top-level product routes"
```

---

### Task 4: Update header navigation and active-state semantics

**Files:**
- Modify: `src/components/layout/Header.astro`
- Modify: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: published category collection.
- Produces: header product link `/two-way-radio/` and product active state for all category/detail paths.

- [ ] **Step 1: Add failing header assertions**

Change approved navigation to `['产品中心', '/two-way-radio/']`. Visit `/mesh-network/` and `/two-way-radio/ly198/` and assert product center has `aria-current="page"`. Visit `/products/` and assert it is not current.

- [ ] **Step 2: Run the layout test and verify failure**

Run: `pnpm playwright test tests/e2e/layout.spec.ts --grep "header"`

Expected: FAIL because the product link and prefix-based active state are old.

- [ ] **Step 3: Implement explicit product-path recognition**

Load published category slugs once in frontmatter and define:

```ts
const productPrefixes = categories.map(({ data }) => `/${data.slug}/`);
const isProductPath = productPrefixes.some((prefix) =>
  currentPath.startsWith(prefix),
);
```

Use `isProductPath` only for the product navigation item; retain existing behavior for all other links.

- [ ] **Step 4: Run header and mobile navigation tests**

Run: `pnpm playwright test tests/e2e/layout.spec.ts`

Expected: PASS, including current mobile borders and keyboard behavior.

- [ ] **Step 5: Commit header migration**

```powershell
git add src/components/layout/Header.astro tests/e2e/layout.spec.ts
git commit -m "feat: route product navigation to first category"
```

---

### Task 5: Build support and six service placeholder routes from one service data source

**Files:**
- Create: `src/data/support-services.ts`
- Create: `src/pages/support/index.astro`
- Create: `src/pages/support/[service].astro`
- Create: `tests/unit/support-services.test.ts`
- Create: `tests/e2e/support.spec.ts`

**Interfaces:**
- Produces: `SupportService { id; name; description; icon; href?: string }` and ordered `supportServices` array of six items.
- Produces: six confirmed `href` values under `/support/` for footer use and future page development.

- [ ] **Step 1: Write failing data and page tests**

Unit test exact ordered names and hrefs. E2E test `/support/` plus all six service paths return 200, expose correct canonicals/headings, use `.foundation-placeholder`, and contain no FAQ/manual/after-sales or service-card UI.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run tests/unit/support-services.test.ts && pnpm playwright test tests/e2e/support.spec.ts`

Expected: FAIL because services and support routes do not exist.

- [ ] **Step 3: Add the service records and confirmed paths**

Define the six exact names and confirmed slugs. Set each `href` to `/support/{slug}/`. Retain optional description/icon metadata only as future design inputs; no icon dependency is installed in this phase.

- [ ] **Step 4: Implement the support index placeholder**

Render `BaseLayout` with title “技术支持”, canonical `/support/`, breadcrumb, and `.foundation-placeholder`. Do not render service cards or service standards.

- [ ] **Step 5: Implement one static service placeholder template**

Use `getStaticPaths()` over `supportServices` and render `BaseLayout` with service name, confirmed canonical, support/service breadcrumbs, and `.foundation-placeholder`. Do not add service-specific features or designs.

- [ ] **Step 6: Run support tests**

Run: `pnpm vitest run tests/unit/support-services.test.ts && pnpm playwright test tests/e2e/support.spec.ts`

Expected: PASS for seven placeholder pages and no stale support content.

- [ ] **Step 7: Commit support page**

```powershell
git add src/data/support-services.ts src/pages/support/index.astro src/pages/support/[service].astro tests/unit/support-services.test.ts tests/e2e/support.spec.ts
git commit -m "feat: add support service placeholders"
```

---

### Task 6: Rebuild footer navigation, mobile hit areas, and legal layout

**Files:**
- Modify: `src/components/layout/Footer.astro`
- Modify: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: published categories, all published solutions, and `supportServices`.
- Produces: four footer groups and five legal items with approved responsive behavior.

- [ ] **Step 1: Replace old footer tests with failing approved-structure tests**

Assert four groups; no “全部产品”, “全部解决方案”, or legal fifth group; all solution detail links are present; services are text when `href` is absent; and about anchors are `/about/#company`, `/about/#qualifications`, `/about/#contact`.

For mobile, capture title-link and toggle bounding boxes and assert they do not overlap. Click the title link with a route interception assertion and verify it does not change expansion. Click blank row space and verify only expansion changes. Verify Enter/Space on the toggle button.

- [ ] **Step 2: Run focused footer tests and verify failure**

Run: `pnpm playwright test tests/e2e/layout.spec.ts --grep "footer|legal"`

Expected: FAIL because the existing footer has five `<details>` groups and native summary-only behavior.

- [ ] **Step 3: Implement four data-driven groups**

Do not slice solutions. Product details are exactly four category links. Support details map `supportServices`, rendering text or anchors by optional `href`. About details retain approved anchors. Group title model:

```ts
type FooterGroup = {
  title: string;
  titleHref?: string;
  links: Array<{ label: string; href?: string }>;
};
```

- [ ] **Step 4: Implement accessible two-zone mobile rows**

Replace native `<details>/<summary>` with a heading row, visible title link/text, and a sibling `<button aria-expanded aria-controls>`. CSS grid sizes the title to content and the button to all remaining row space; the button includes the state icon aligned right. JavaScript toggles the controlled list `hidden` state and synchronizes at the 48rem breakpoint. Link and button are siblings and never nested.

- [ ] **Step 5: Implement legal area**

Desktop `.footer-legal` contains copyright, two filing spans, `/legal/`, and `/privacy/`, uses `display:flex` and `justify-content:space-between`. Mobile nests the last four items in `.footer-legal-secondary`, centers both rows, and allows only the secondary group to wrap on extreme widths.

- [ ] **Step 6: Run all layout tests**

Run: `pnpm playwright test tests/e2e/layout.spec.ts`

Expected: PASS at 320, 647, 768, 1440, 1920, and 2560px without overflow.

- [ ] **Step 7: Commit footer redesign**

```powershell
git add src/components/layout/Footer.astro tests/e2e/layout.spec.ts
git commit -m "feat: rebuild footer navigation and legal layout"
```

---

### Task 7: Synchronize maintained documentation and project status

**Files:**
- Modify: `SiteMap.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/superpowers/plans/2026-08-08-shengborun-static-site.md`

**Interfaces:**
- Produces: maintained docs that contain only the current route/support/footer rules and explicitly mark `/products/` as temporary.

- [ ] **Step 1: Search for stale maintained statements**

Run:

```powershell
Get-ChildItem SiteMap.md,docs/PROJECT_STATUS.md,docs/superpowers/plans/2026-08-08-shengborun-static-site.md | Select-String -Pattern '/products/\{category|/support/faq|使用说明|售后服务|全部解决方案|五栏'
```

Expected: matches identify every current contradiction.

- [ ] **Step 2: Rewrite the authoritative route, support, and footer sections**

Update product routes, homepage responsibility, temporary `/products/`, six services, four footer groups, title-link rules, about anchors, and legal area. Add an explicit note that historical specs/plans describe completed past decisions and are not current authority when superseded by `2026-08-12-site-structure-and-support-redesign.md`.

- [ ] **Step 3: Verify stale statements are gone from maintained docs**

Repeat the search. Expected: no conflicting matches; matches are allowed only in clearly labeled “cancelled legacy routes/content” sections.

- [ ] **Step 4: Commit documentation synchronization**

```powershell
git add SiteMap.md docs/PROJECT_STATUS.md docs/superpowers/plans/2026-08-08-shengborun-static-site.md
git commit -m "docs: synchronize current site architecture"
```

---

### Task 8: Complete regression verification and visual design QA

**Files:**
- Modify: `design-qa.md`
- Create: `docs/superpowers/qa/support-redesign/source.png`
- Create: `docs/superpowers/qa/support-redesign/implementation-desktop.png`
- Create: `docs/superpowers/qa/support-redesign/implementation-mobile.png`
- Create: `docs/superpowers/qa/support-redesign/comparison-desktop.png`

**Interfaces:**
- Produces: full passing build/test evidence and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Run complete automated verification**

Run: `pnpm run test`

Expected: content validation, Vitest, Astro check/build, and all Playwright tests PASS.

- [ ] **Step 2: Inspect generated route output**

Verify these files exist: `dist/index.html`, `dist/products/index.html`, `dist/two-way-radio/index.html`, `dist/two-way-radio/ly198/index.html`, `dist/support/index.html`. Verify `dist/products/two-way-radio/` does not exist and sitemap contains new paths only.

- [ ] **Step 3: Start the local preview and capture matching states**

Start the existing Astro dev server on its configured local port. Open the support page in the Codex in-app browser, capture desktop at the reference width and mobile at 320px, and test header, category switcher, footer title links, blank-row expansion zones, about anchors, and legal links.

- [ ] **Step 4: Compare reference and implementation visually**

Open the supplied support reference and desktop implementation screenshot together. Record P0–P3 differences in `design-qa.md`, including section width, card proportions, spacing, icon scale/color, typography, divider rhythm, and mobile 2 × 3 behavior.

- [ ] **Step 5: Fix all P0/P1/P2 findings and repeat capture**

Run the relevant E2E test after each fix. Repeat the visual comparison until `design-qa.md` states exactly `final result: passed`. Remaining P3 polish may be listed as optional follow-up.

- [ ] **Step 6: Run final clean verification**

Run: `pnpm run test && git diff --check && git status --short`

Expected: all tests PASS, no whitespace errors, and only intended QA artifacts/status updates remain.

- [ ] **Step 7: Commit final QA evidence**

```powershell
git add design-qa.md docs/superpowers/qa/support-redesign
git commit -m "test: verify site migration and support redesign"
```
