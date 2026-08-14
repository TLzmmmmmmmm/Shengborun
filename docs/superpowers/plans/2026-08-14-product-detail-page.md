# Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace product-detail placeholders with a reusable responsive page containing a product overview, library-backed Feature icons, accessible desktop parameter tabs, one merged mobile parameter table, and a centered inquiry CTA.

**Architecture:** Keep the existing Astro route and content collections. Add a canonical JSON Feature library plus a small resolver, then compose four focused Astro components from `[category]/[product].astro`; only the desktop parameter tabs require client-side JavaScript, while all product content remains statically rendered.

**Tech Stack:** Astro 6, TypeScript, Astro Content Collections, `@lucide/astro`, Vitest, Playwright.

## Global Constraints

- Routes remain `/{category-slug}/{product-slug}/`; do not add `/products/` before category routes.
- Continue using the existing `BaseLayout`, Header, Footer, tokens, `site-container`, and 100rem content-width convention.
- Use only `coverImage`; do not render `galleryImages` or Gallery controls.
- Render at most the first four `keyFeatures` in source order.
- Replace planned Feature colors with canonical library-backed Icon identifiers; related Features may reuse Icons.
- Desktop technical parameters use left-side tabs and one visible group table.
- Mobile technical parameters flatten all groups into one continuous table with no Group navigation.
- The CTA label is `立即咨询`, links to `/about#contact`, uses brand teal with black text, and is centered.
- Preserve all category-page, product-card, Header, Footer, and mobile Footer behavior.

---

## File Structure

### Create

- `src/lib/product-features.ts` — Feature Icon identifier type, Feature definition type, and strict resolver.
- `src/components/products/ProductFeatureList.astro` — maps Feature identifiers to Lucide components and renders up to four icon-label items.
- `src/components/products/ProductHero.astro` — responsive cover image, name, description, and Feature presentation.
- `src/components/products/TechnicalParameters.astro` — desktop tabs, mobile flattened table, empty state, and tab interaction script.
- `src/components/products/ProductInquiryCta.astro` — centered consultation CTA.
- `src/lib/technical-parameters.ts` — pure preparation of stable desktop groups, flattened mobile Items, and empty state.
- `tests/e2e/product-detail.spec.ts` — product-detail layout, interaction, responsiveness, and accessibility coverage.
- `tests/unit/technical-parameters.test.ts` — parameter ordering, fallback labels, and empty-state coverage.
- `docs/design-previews/product-detail/product-detail-desktop-1440x900.png` — final desktop evidence.
- `docs/design-previews/product-detail/product-detail-mobile-390x844.png` — final mobile evidence.

### Modify

- `src/content/product-features/features.json` — populate the canonical Feature-to-Icon library.
- `src/lib/content-rules.ts` — replace the obsolete color list with Feature library schema and validate product Feature references.
- `scripts/validate-content.mjs` — load Feature definitions and include them in reference validation.
- `tests/unit/content-schema.test.ts` — replace color assertions with Feature schema and reference-validation tests.
- `src/pages/[category]/[product].astro` — replace placeholder with the shared detail-page composition and real metadata.
- `tests/e2e/product-routes.spec.ts` — remove the obsolete placeholder assertion while retaining route-link coverage.
- `design-qa.md` — add source/reference paths, matched viewports, comparison history, findings, and final result.

---

### Task 1: Canonical Feature Library and Validation

**Files:**
- Create: `src/lib/product-features.ts`
- Modify: `src/content/product-features/features.json`
- Modify: `src/lib/content-rules.ts`
- Modify: `scripts/validate-content.mjs`
- Test: `tests/unit/content-schema.test.ts`

**Interfaces:**
- Produces: `ProductFeatureIcon`, `ProductFeatureDefinition`, and `resolveProductFeatures(names, library, limit?)`.
- Produces: `productFeatureLibrarySchema` for validation.
- Extends: `validateContentReferences({ categories, products, features })`.
- Later tasks consume: `ResolvedProductFeature[]` returned by `resolveProductFeatures`.

- [ ] **Step 1: Replace the obsolete color test with failing Feature library tests**

Add imports and tests equivalent to:

```ts
import featureLibrary from '../../src/content/product-features/features.json';
import {
  productFeatureLibrarySchema,
  validateContentReferences,
} from '../../src/lib/content-rules';
import { resolveProductFeatures } from '../../src/lib/product-features';

it('accepts the canonical name and icon feature library', () => {
  const result = productFeatureLibrarySchema.safeParse([
    { name: '一键对频', icon: 'scan-line' },
    { name: '电量提示', icon: 'battery' },
  ]);
  expect(result.success).toBe(true);
  expect(productFeatureLibrarySchema.safeParse([
    { name: '一键对频', color: 'teal' },
  ]).success).toBe(false);
});

it('resolves at most four product features in source order', () => {
  const resolved = resolveProductFeatures(
    ['一键对频', '一体天线', '小巧轻薄', '电量提示', '智能降噪'],
    featureLibrary,
  );
  expect(resolved.map(({ name }) => name)).toEqual([
    '一键对频', '一体天线', '小巧轻薄', '电量提示',
  ]);
});

it('reports an unknown feature used by a published product', () => {
  const errors = validateContentReferences({
    categories: [{ id: 'two-way-radio', slug: 'two-way-radio' }],
    products: [{
      id: 'radio-sample',
      categoryId: 'two-way-radio',
      keyFeatures: ['不存在的功能'],
      published: true,
    }],
    features: [{ name: '一键对频', icon: 'scan-line' }],
  });
  expect(errors).toContain(
    'Unknown product feature "不存在的功能" referenced by product "radio-sample"',
  );
});
```

Update every existing `validateContentReferences` fixture to include `published` and `features`.

- [ ] **Step 2: Run the unit test and verify RED**

Run:

```powershell
pnpm vitest run tests/unit/content-schema.test.ts
```

Expected: FAIL because `productFeatureLibrarySchema`, `resolveProductFeatures`, and Feature reference validation do not exist.

- [ ] **Step 3: Implement the Feature types and strict resolver**

Create `src/lib/product-features.ts`:

```ts
export const PRODUCT_FEATURE_ICONS = [
  'antenna', 'backpack', 'badge-check', 'battery', 'bell', 'blocks',
  'feather', 'globe', 'hand', 'headphones', 'layers', 'monitor',
  'radio', 'radio-tower', 'scan-line', 'shield-check', 'signal',
  'sliders', 'volume', 'zap',
] as const;

export type ProductFeatureIcon = (typeof PRODUCT_FEATURE_ICONS)[number];

export interface ProductFeatureDefinition {
  name: string;
  icon: ProductFeatureIcon;
}

export type ResolvedProductFeature = ProductFeatureDefinition;

export function resolveProductFeatures(
  names: readonly string[],
  library: readonly ProductFeatureDefinition[],
  limit = 4,
): ResolvedProductFeature[] {
  const byName = new Map(library.map((feature) => [feature.name, feature]));
  return names.slice(0, limit).map((name) => {
    const feature = byName.get(name);
    if (!feature) throw new Error(`Unknown product feature: ${name}`);
    return feature;
  });
}
```

- [ ] **Step 4: Define the Feature schema and reference validation**

In `src/lib/content-rules.ts`:

```ts
import { PRODUCT_FEATURE_ICONS } from './product-features';

export const productFeatureLibrarySchema = z.array(
  z.object({
    name: z.string().min(1),
    icon: z.enum(PRODUCT_FEATURE_ICONS),
  }).strict(),
).min(1);
```

Extend `ContentReferences` with:

```ts
features: Array<{ name: string; icon: string }>;
products: Array<{
  id: string;
  categoryId: string;
  keyFeatures?: string[];
  published: boolean;
}>;
```

Add duplicate Feature-name detection and, for each `product.published === true`, report every `keyFeatures` entry absent from `features` using the exact message asserted above.

- [ ] **Step 5: Populate every currently used Feature mapping**

Set `src/content/product-features/features.json` to this canonical array:

```json
[
  { "name": "一键对频", "icon": "scan-line" },
  { "name": "一体天线", "icon": "antenna" },
  { "name": "小巧轻薄", "icon": "feather" },
  { "name": "电量提示", "icon": "battery" },
  { "name": "5G全网通公网", "icon": "globe" },
  { "name": "远距离通话", "icon": "radio-tower" },
  { "name": "柔性天线", "icon": "antenna" },
  { "name": "智能降噪", "icon": "volume" },
  { "name": "双屏显示", "icon": "monitor" },
  { "name": "手动调频", "icon": "sliders" },
  { "name": "UV双段", "icon": "signal" },
  { "name": "一键报警", "icon": "bell" },
  { "name": "双模扩展", "icon": "layers" },
  { "name": "耳挂对讲", "icon": "headphones" },
  { "name": "适配多种平台", "icon": "blocks" },
  { "name": "国产短波", "icon": "badge-check" },
  { "name": "固定短波", "icon": "radio" },
  { "name": "维和免检", "icon": "shield-check" },
  { "name": "500W短波", "icon": "zap" },
  { "name": "背负短波", "icon": "backpack" },
  { "name": "手持短波", "icon": "hand" }
]
```

- [ ] **Step 6: Load and validate the library in the content script**

In `scripts/validate-content.mjs`, add a single-file reader and pass the parsed array:

```js
async function readJsonFile(relativePath) {
  return JSON.parse(await readFile(path.join(contentRoot, relativePath), 'utf8'));
}

const [categories, products, features] = await Promise.all([
  readJsonDirectory('product-categories'),
  readJsonDirectory('products'),
  readJsonFile(path.join('product-features', 'features.json')),
]);

const errors = validateContentReferences({ categories, products, features });
```

Update the nested fixture test to create `product-features/features.json` and include valid Feature references.

- [ ] **Step 7: Run tests and content validation to verify GREEN**

Run:

```powershell
pnpm vitest run tests/unit/content-schema.test.ts
pnpm run validate:content
```

Expected: all content-schema tests pass and output includes `Content references are valid.`

- [ ] **Step 8: Commit Task 1**

```powershell
git add src/content/product-features/features.json src/lib/product-features.ts src/lib/content-rules.ts scripts/validate-content.mjs tests/unit/content-schema.test.ts
git commit -m "feat: add product feature icon library"
```

---

### Task 2: Product Overview and Feature Components

**Files:**
- Create: `src/components/products/ProductFeatureList.astro`
- Create: `src/components/products/ProductHero.astro`
- Modify: `src/pages/[category]/[product].astro`
- Create: `tests/e2e/product-detail.spec.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- Consumes: `ResolvedProductFeature[]` from Task 1.
- `ProductFeatureList` props: `{ features: ResolvedProductFeature[] }`.
- `ProductHero` props: `{ name: string; description?: string; coverImage: string; features: ResolvedProductFeature[] }`.
- Produces: `[data-product-detail]`, `[data-product-hero]`, `[data-product-cover]`, and `[data-detail-feature]` selectors.

- [ ] **Step 1: Write failing desktop and mobile overview tests**

Create `tests/e2e/product-detail.spec.ts` with tests equivalent to:

```ts
import { expect, test } from '@playwright/test';

test.describe('product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/two-way-radio/ly198/');
  });

  test('renders product overview with four library icons', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(page.locator('.foundation-placeholder')).toHaveCount(0);
    await expect(page.locator('[data-product-detail]')).toBeVisible();
    await expect(page.getByRole('heading', { name: '润信达 LY198', level: 1 })).toBeVisible();
    await expect(page.locator('[data-product-cover]')).toHaveAttribute(
      'src', '/images/products/two-way-radio/ly198/ly198.jpeg',
    );
    await expect(page.locator('[data-product-description]')).toContainText('模拟对讲机');
    await expect(page.locator('[data-detail-feature]')).toHaveCount(4);
    await expect(page.locator('[data-detail-feature] svg')).toHaveCount(4);
    await expect(page.locator('[data-product-gallery]')).toHaveCount(0);
  });

  test('stacks the overview and uses a two-column feature grid on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const imageBox = await page.locator('[data-product-media]').boundingBox();
    const infoBox = await page.locator('[data-product-info]').boundingBox();
    expect(imageBox!.y).toBeLessThan(infoBox!.y);
    const xs = await page.locator('[data-detail-feature]').evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().x)),
    );
    expect(new Set(xs).size).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
```

Remove the old `keeps product detail routes as BaseLayout placeholders` test from `tests/e2e/product-routes.spec.ts`; keep its route and Breadcrumb expectations for Task 4.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "overview"
```

Expected: FAIL because the route still renders `.foundation-placeholder` and the new selectors do not exist.

- [ ] **Step 3: Implement `ProductFeatureList.astro`**

Import the supported Lucide Astro components and map every identifier from Task 1:

```astro
---
import {
  Antenna, Backpack, BadgeCheck, Battery, Bell, Blocks, Feather, Globe,
  Hand, Headphones, Layers, Monitor, Radio, RadioTower, ScanLine,
  ShieldCheck, Signal, SlidersHorizontal, Volume2, Zap,
} from '@lucide/astro';
import type { ProductFeatureIcon, ResolvedProductFeature } from '../../lib/product-features';

interface Props { features: ResolvedProductFeature[] }
const { features } = Astro.props;
const icons = {
  antenna: Antenna, backpack: Backpack, 'badge-check': BadgeCheck,
  battery: Battery, bell: Bell, blocks: Blocks, feather: Feather,
  globe: Globe, hand: Hand, headphones: Headphones, layers: Layers,
  monitor: Monitor, radio: Radio, 'radio-tower': RadioTower,
  'scan-line': ScanLine, 'shield-check': ShieldCheck, signal: Signal,
  sliders: SlidersHorizontal, volume: Volume2, zap: Zap,
} satisfies Record<ProductFeatureIcon, typeof Antenna>;
---
```

Render `features.slice(0, 4)` as an unstyled list with `data-detail-feature`, Icon above label, brand teal Icon color, and a four-column desktop/two-column mobile grid.

- [ ] **Step 4: Implement `ProductHero.astro`**

Render:

```astro
<section class="product-hero" data-product-hero>
  <div class="product-media" data-product-media>
    <img data-product-cover src={coverImage} alt={`${name} 产品图`} />
  </div>
  <div class="product-info" data-product-info>
    <h1>{name}</h1>
    {description && <p data-product-description>{description}</p>}
    <ProductFeatureList features={features} />
  </div>
</section>
```

Use a desktop `grid-template-columns: minmax(0, 48%) minmax(0, 52%)`, an image surface with `aspect-ratio: 1`, and `object-fit: contain`. At `max-width: 47.999rem`, switch to one column and keep the image before information.

- [ ] **Step 5: Replace the route placeholder with initial detail composition**

In `[category]/[product].astro`, import the Feature JSON, resolver, `Breadcrumbs`, and `ProductHero`. Resolve:

```ts
const resolvedFeatures = resolveProductFeatures(
  product.keyFeatures,
  productFeatureLibrary,
);
```

Render a `.product-detail-page` and `.product-detail-content.site-container` with the main Breadcrumb followed by `<ProductHero ... />`. Add `data-product-detail` to the page wrapper. Do not add technical parameters or CTA until Tasks 3 and 4.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "overview"
pnpm run check
```

Expected: overview tests pass and Astro reports 0 errors, warnings, and hints.

- [ ] **Step 7: Commit Task 2**

```powershell
git add src/components/products/ProductFeatureList.astro src/components/products/ProductHero.astro src/pages/[category]/[product].astro tests/e2e/product-detail.spec.ts tests/e2e/product-routes.spec.ts
git commit -m "feat: build product detail overview"
```

---

### Task 3: Accessible Technical Parameter Presentation

**Files:**
- Create: `src/components/products/TechnicalParameters.astro`
- Create: `src/lib/technical-parameters.ts`
- Modify: `src/pages/[category]/[product].astro`
- Test: `tests/e2e/product-detail.spec.ts`
- Test: `tests/unit/technical-parameters.test.ts`

**Interfaces:**
- Consumes: `technicalParameters: Array<{ group?: string; items: Array<{ name: string; value: string }> }>`.
- Produces: `prepareTechnicalParameters(parameters)` returning `{ groups, allItems, isEmpty }`.
- Produces: `[data-technical-parameters]`, `[data-parameter-tab]`, `[data-parameter-panel]`, `[data-mobile-parameter-table]`, and `[data-parameter-empty]`.

- [ ] **Step 1: Write failing parameter preparation unit tests**

Create `tests/unit/technical-parameters.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { prepareTechnicalParameters } from '../../src/lib/technical-parameters';

describe('technical parameter presentation', () => {
  it('preserves desktop groups and flattens mobile items in source order', () => {
    const result = prepareTechnicalParameters([
      { group: '一般规格', items: [{ name: '频率', value: '400 MHz' }] },
      { group: '环境参数', items: [{ name: '温度', value: '-20℃～55℃' }] },
    ]);
    expect(result.groups.map(({ label }) => label)).toEqual(['一般规格', '环境参数']);
    expect(result.allItems.map(({ name }) => name)).toEqual(['频率', '温度']);
    expect(result.isEmpty).toBe(false);
  });

  it('reports empty data and supplies a stable fallback group label', () => {
    expect(prepareTechnicalParameters([])).toEqual({
      groups: [], allItems: [], isEmpty: true,
    });
    expect(prepareTechnicalParameters([{ items: [{ name: '功率', value: '2 W' }] }]).groups[0])
      .toMatchObject({ id: 'parameter-group-0', label: '技术参数' });
  });
});
```

- [ ] **Step 2: Run the unit test and verify RED**

Run:

```powershell
pnpm exec vitest run tests/unit/technical-parameters.test.ts
```

Expected: FAIL because `src/lib/technical-parameters.ts` does not exist.

- [ ] **Step 3: Implement the pure parameter preparation helper**

Create `src/lib/technical-parameters.ts`:

```ts
export interface TechnicalParameterItem { name: string; value: string }
export interface TechnicalParameterInput {
  group?: string;
  items: TechnicalParameterItem[];
}

export function prepareTechnicalParameters(
  parameters: readonly TechnicalParameterInput[],
) {
  const groups = parameters.map((parameter, index) => ({
    id: `parameter-group-${index}`,
    label: parameter.group ?? '技术参数',
    items: parameter.items,
  }));
  const allItems = groups.flatMap(({ items }) => items);
  return { groups, allItems, isEmpty: allItems.length === 0 };
}
```

- [ ] **Step 4: Run the helper test and verify GREEN**

Run:

```powershell
pnpm exec vitest run tests/unit/technical-parameters.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Write failing parameter rendering and interaction tests**

Add tests:

```ts
test('switches desktop parameter groups with pointer and keyboard input', async ({ page }) => {
  await page.goto('/shortwave-radio/envoy-x/');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const tabs = page.locator('[data-parameter-tab]');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-parameter-panel]:visible')).toHaveCount(1);
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-parameter-panel]:visible')).toContainText('电压范围');
  await tabs.nth(1).press('ArrowDown');
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
});

test('merges every parameter item into one mobile table', async ({ page }) => {
  await page.goto('/shortwave-radio/envoy-x/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('[data-parameter-tab]')).toBeHidden();
  const mobileTable = page.locator('[data-mobile-parameter-table]');
  await expect(mobileTable).toBeVisible();
  await expect(mobileTable).toContainText('信道和扫描组');
  await expect(mobileTable).toContainText('电压范围');
  await expect(mobileTable).toContainText('环境标准');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
```

- [ ] **Step 6: Run the focused tests and verify RED**

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "parameter"
```

Expected: FAIL because the parameter component and selectors do not exist.

- [ ] **Step 7: Implement semantic desktop tabs and tables**

Create `TechnicalParameters.astro`, call `prepareTechnicalParameters(parameters)`, and use its `groups`, `allItems`, and `isEmpty` outputs. For non-empty data:

- Render `<section aria-labelledby="technical-parameters-title">`.
- Render an `h2` with `技术参数`.
- Render desktop tab buttons in source order, using `group ?? '技术参数'` as the label.
- Use index-based stable IDs such as `parameter-tab-0` and `parameter-panel-0`.
- Set the first tab `aria-selected="true"` and `tabindex="0"`; other tabs use `false` and `-1`.
- Set only the first panel visible; other panels carry `hidden`.
- Render each Item as `<tr><th scope="row">{name}</th><td>{value}</td></tr>`.
- Render a separate mobile table from prepared `allItems`.

For empty data, render:

```astro
<section class="technical-parameters" data-technical-parameters>
  <h2>技术参数</h2>
  <p class="parameter-empty" data-parameter-empty>技术参数整理中</p>
</section>
```

- [ ] **Step 8: Add the scoped tab enhancement script**

Use a plain `<script>` that initializes each `[data-technical-parameters]` root independently:

```ts
document.querySelectorAll<HTMLElement>('[data-technical-parameters]').forEach((root) => {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-parameter-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-parameter-panel]'));

  const activate = (index: number, moveFocus = false) => {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
    if (moveFocus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const next = event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home' ? 0
          : event.key === 'End' ? last
          : undefined;
      if (next !== undefined) {
        event.preventDefault();
        activate(next, true);
      }
    });
  });
});
```

- [ ] **Step 9: Implement responsive table styling**

- Desktop: two-column section layout with a compact left navigation and flexible right panel.
- Use `table-layout: fixed; width: 100%`.
- Use `th { width: 34%; overflow-wrap: anywhere; }` and `td { overflow-wrap: anywhere; }`.
- Mobile at `47.999rem`: hide `.parameter-desktop`, display `.parameter-mobile`, and keep a single continuous table.
- Desktop: hide `.parameter-mobile`.
- Ensure `[hidden] { display: none; }` wins over any panel display declaration.

- [ ] **Step 10: Compose the component and verify GREEN**

Add below `ProductHero`:

```astro
<TechnicalParameters parameters={product.technicalParameters} />
```

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "parameter"
pnpm exec vitest run tests/unit/technical-parameters.test.ts
pnpm run check
```

Expected: parameter tests pass and Astro diagnostics are clean.

- [ ] **Step 11: Commit Task 3**

```powershell
git add src/components/products/TechnicalParameters.astro src/lib/technical-parameters.ts src/pages/[category]/[product].astro tests/e2e/product-detail.spec.ts tests/unit/technical-parameters.test.ts
git commit -m "feat: add product parameter tabs"
```

---

### Task 4: Breadcrumbs, Metadata, and Inquiry CTA

**Files:**
- Create: `src/components/products/ProductInquiryCta.astro`
- Modify: `src/pages/[category]/[product].astro`
- Modify: `tests/e2e/product-detail.spec.ts`
- Modify: `tests/e2e/product-routes.spec.ts`

**Interfaces:**
- `ProductInquiryCta` has no required props and always renders `/about#contact` with label `立即咨询`.
- The route supplies a four-level main Breadcrumb and matching `BaseLayout` Footer Breadcrumb data.

- [ ] **Step 1: Write failing CTA, Breadcrumb, and metadata tests**

Add:

```ts
test('renders product breadcrumbs, metadata and the centered inquiry CTA', async ({ page }) => {
  await page.goto('/two-way-radio/ly198/');
  const breadcrumb = page.getByRole('main').getByRole('navigation', { name: '面包屑' });
  await expect(breadcrumb.getByRole('link', { name: '产品中心' })).toHaveAttribute('href', '/products/');
  await expect(breadcrumb.getByRole('link', { name: '对讲机通信' })).toHaveAttribute('href', '/two-way-radio/');
  await expect(breadcrumb).toContainText('润信达 LY198');
  await expect(page).toHaveTitle(/润信达 LY198/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /模拟对讲机/);
  const cta = page.getByRole('link', { name: '立即咨询' });
  await expect(cta).toHaveAttribute('href', '/about#contact');
  const ctaBox = (await cta.boundingBox())!;
  expect(Math.abs((ctaBox.x + ctaBox.width / 2) - 720)).toBeLessThan(2);
});

```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "breadcrumbs"
```

Expected: FAIL because the CTA and final route metadata have not been implemented.

- [ ] **Step 3: Implement the consultation component**

Create `ProductInquiryCta.astro`:

```astro
<section class="product-inquiry" aria-label="产品咨询">
  <a class="product-inquiry__button" href="/about#contact">立即咨询</a>
</section>
```

Center the link with Grid or Flex. Use `background: var(--brand-teal)`, black text, visible hover/focus treatment, minimum height `3rem`, desktop width around `13rem`, and mobile width `min(20rem, 100%)` inside page gutters.

- [ ] **Step 4: Finalize route metadata and Breadcrumbs**

In `[category]/[product].astro`:

- Add main `Breadcrumbs` immediately under the Header inside the page container.
- Pass the same category/product hierarchy to `BaseLayout` for the Footer Breadcrumb.
- Set `description={product.productFeatures ?? `${product.name}产品信息与技术参数。`}`.
- Keep `canonicalPath` unchanged.
- Render `ProductInquiryCta` after `TechnicalParameters`.

- [ ] **Step 5: Verify CTA, Breadcrumb, and metadata GREEN**

Run:

```powershell
pnpm exec playwright test tests/e2e/product-detail.spec.ts --grep "breadcrumbs"
pnpm run check
```

Expected: focused tests pass and Astro diagnostics remain clean.

- [ ] **Step 6: Commit Task 4**

```powershell
git add src/components/products/ProductInquiryCta.astro src/pages/[category]/[product].astro tests/e2e/product-detail.spec.ts tests/e2e/product-routes.spec.ts
git commit -m "feat: complete product detail page"
```

---

### Task 5: Visual QA and Full Regression

**Files:**
- Create: `docs/design-previews/product-detail/product-detail-desktop-1440x900.png`
- Create: `docs/design-previews/product-detail/product-detail-mobile-390x844.png`
- Modify: `tests/e2e/product-detail.spec.ts`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: the complete product-detail route.
- Produces: browser-rendered evidence and a passing Design QA record.

- [ ] **Step 1: Add conditional screenshot capture to product-detail tests**

At the end of the representative desktop and mobile tests:

```ts
if (process.env.CAPTURE_PRODUCT_DETAIL === '1') {
  await page.screenshot({
    path: 'docs/design-previews/product-detail/product-detail-desktop-1440x900.png',
    fullPage: true,
  });
}
```

Use the mobile path in the mobile test and preserve `deviceScaleFactor: 1` through the existing Playwright project.

- [ ] **Step 2: Run complete focused product-detail coverage**

Run:

```powershell
$env:CAPTURE_PRODUCT_DETAIL='1'
pnpm exec playwright test tests/e2e/product-detail.spec.ts
Remove-Item Env:CAPTURE_PRODUCT_DETAIL
```

Expected: all product-detail tests pass and both screenshot files are created.

- [ ] **Step 3: Perform blocking visual comparison**

Open together:

- Source: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-b5ebcb15-76a6-493e-9efd-e159f5dadbb1.png`.
- Desktop implementation: `docs/design-previews/product-detail/product-detail-desktop-1440x900.png`.
- Mobile implementation: `docs/design-previews/product-detail/product-detail-mobile-390x844.png`.

Compare hierarchy, Header/body/Footer rhythm, cover-image scale, two-column balance, Feature icon weight, table density, tab affordance, CTA position, mobile wrapping, typography, colors, image sharpness, and copy. Fix all P0/P1/P2 differences, recapture, and repeat until no actionable P0/P1/P2 finding remains.

- [ ] **Step 4: Update `design-qa.md`**

Record:

- source visual truth path;
- implementation screenshot paths and pixel dimensions;
- CSS viewports and density normalization;
- default product/detail state;
- full-view and focused comparison evidence;
- required fidelity surfaces;
- every P0/P1/P2 iteration and fix;
- any P3 follow-up;
- exact final line `final result: passed`.

- [ ] **Step 5: Run full verification**

Stop any manually running server on port 4321, then run:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
pnpm run test:unit
pnpm run validate:content
pnpm run check
pnpm run build
pnpm run test:e2e
git diff --check
```

Expected:

- all Vitest files pass;
- content references are valid;
- Astro reports 0 errors, warnings, and hints;
- all static routes build;
- all Playwright tests pass;
- `git diff --check` exits 0.

- [ ] **Step 6: Commit Task 5**

```powershell
git add tests/e2e/product-detail.spec.ts docs/design-previews/product-detail design-qa.md
git commit -m "test: verify product detail experience"
```

---

## Final Review Checklist

- [ ] Every published non-empty product Feature has a valid library Icon.
- [ ] No Feature definition contains `color`.
- [ ] Product detail routes render real content instead of placeholders.
- [ ] Main and Footer Breadcrumbs retain the approved route hierarchy.
- [ ] Cover images use `contain` and no Gallery control exists.
- [ ] Desktop overview is two-column; mobile overview is stacked.
- [ ] Feature count is capped at four; mobile Feature layout is two columns.
- [ ] Desktop parameter tabs work with mouse and keyboard.
- [ ] Mobile parameters appear as one merged table without group navigation.
- [ ] Empty technical parameters show `技术参数整理中`.
- [ ] CTA is centered, brand teal, black text, and links to `/about#contact`.
- [ ] No horizontal overflow exists at 390px or the minimum supported 320px.
- [ ] `design-qa.md` ends with `final result: passed`.
- [ ] Full unit, content, diagnostic, build, and browser verification passes.
