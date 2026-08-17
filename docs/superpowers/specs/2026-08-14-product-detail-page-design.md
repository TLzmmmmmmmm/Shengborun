# Product Detail Page Design

**Date:** 2026-08-14

## Goal

Replace every published product-detail placeholder with a shared, responsive product-detail page. Preserve the current route structure, Header, Footer, category pages, and product-list behavior.

The reference screenshot defines the information hierarchy rather than a pixel-perfect visual target. The implementation must continue the existing Shengborun design system, content width, spacing, typography, and brand tokens.

## Routes and Page Shell

- Product detail routes remain `/{category-slug}/{product-slug}/`.
- The page uses the existing `BaseLayout`, Header, and Footer.
- The main content uses the same maximum width and responsive gutters as `/products/` and category pages.
- The main breadcrumb appears immediately below the Header and is visually secondary:
  - 首页
  - 产品中心
  - current category
  - current product
- The existing Footer breadcrumb remains available through `BaseLayout`.

## Product Overview

### Desktop

- The overview uses two columns.
- The left column occupies approximately 48% and contains a bordered, white image surface.
- The right column occupies approximately 52% and contains the product name, description, and Feature list.
- The product name is the page's only `h1`.
- The description comes from `product.productFeatures`.
- The image comes only from `product.coverImage` and uses `object-fit: contain`; it must never be cropped.
- `galleryImages` are not rendered and no Gallery controls are implemented.
- Up to four entries from `product.keyFeatures` are displayed in source order.
- Each Feature uses an icon above its label. Icons use the existing brand teal color and the same linear visual language as the site's category navigation.

### Mobile

- The overview becomes a single column.
- The image appears first, followed by product name and description.
- Features use a two-column grid, forming a 2x2 layout when four Features are present.
- Fewer than four Features occupy only the required cells.

## Feature Library

- `src/content/product-features/features.json` remains the canonical Feature library.
- Each Feature definition contains:
  - `name`: the exact label referenced by product `keyFeatures`.
  - `icon`: a stable icon identifier supported by the site's icon registry.
- The previous planned `color` property is removed and must not be used.
- Product JSON files continue to store Feature labels only; they do not store icon component names.
- Semantically related Features may reuse the same icon.
- Every Feature referenced by a published, non-empty product must exist in the library.
- Content validation fails with a clear message when a published product references an unknown Feature.
- The initial implementation populates mappings for all Features used by currently published products.
- The first four `keyFeatures` are rendered; additional entries remain valid content but are not shown in the overview.

## Technical Parameters

### Desktop interaction

- The section has a clear “技术参数” heading.
- A left-side vertical navigation lists `technicalParameters[].group` in source order.
- The first group is selected by default.
- The right side displays only the selected group's `items`.
- Each row displays the Item `name` and `value`.
- The name column uses approximately 34% of the table width; the value column uses the remainder.
- Long values wrap without horizontal page overflow.
- Group navigation uses accessible tab semantics:
  - `role="tablist"`, `role="tab"`, and `role="tabpanel"`.
  - `aria-selected`, `aria-controls`, and stable IDs connect controls and panels.
  - Mouse click, Tab focus, Enter/Space activation, and arrow-key navigation are supported.
- Switching a group does not change the URL.

### Mobile presentation

- Group navigation is not rendered visibly.
- All Items from all groups are flattened in original group and Item order.
- The Items appear in one continuous two-column table.
- Group headings are omitted.
- Long names and values wrap naturally.

### Empty state

- When `technicalParameters` is empty, the section displays “技术参数整理中”.
- The empty state uses the same section surface and remains readable on all breakpoints.

## Inquiry CTA

- A dedicated CTA block follows the technical-parameter section and precedes the Footer.
- The button is centered.
- The visible label is “立即咨询”.
- The CTA is a visual placeholder for now and has no destination or click behavior.
- The background uses the company brand teal and the text is black.
- Desktop uses a moderate fixed width.
- Mobile increases the touch target while retaining side margins instead of becoming edge-to-edge.
- Hover and keyboard focus states must remain visible.

## Component Boundaries

- `ProductHero.astro`
  - Owns overview layout and image presentation.
  - Receives product name, description, cover image, and resolved Feature definitions.
- `ProductFeatureList.astro`
  - Owns the four-item limit and icon-plus-label presentation.
  - Does not read product files directly.
- `TechnicalParameters.astro`
  - Owns desktop tabs, mobile flattened table, empty state, and the small client-side interaction script.
- `ProductInquiryCta.astro`
  - Owns the centered consultation link and its responsive sizing.
- `src/pages/[category]/[product].astro`
  - Reads route data, builds Breadcrumbs and metadata, resolves Feature definitions, and composes the components.
  - Does not duplicate component styling or tab logic.

## Data Flow

1. Astro loads published categories and products through the existing content collections.
2. `buildPublishedProductRoutes` supplies the selected category and product.
3. The detail page resolves up to four product Feature labels against the canonical Feature library.
4. Resolved Feature definitions flow into `ProductHero` and `ProductFeatureList`.
5. Raw `technicalParameters` flow into `TechnicalParameters`, which derives desktop groups and the mobile flattened sequence.
6. Static HTML contains all required product information; JavaScript enhances desktop group switching only.

## Accessibility and Progressive Enhancement

- The cover image has product-specific alternative text.
- Breadcrumb, headings, tabs, tables, and CTA use native semantic elements where possible.
- Table rows retain correct header/value relationships.
- Focus indicators use existing site focus styling or an equally visible brand-compatible outline.
- With JavaScript unavailable, the first desktop parameter group remains visible and mobile still presents the complete parameter list.
- Motion respects `prefers-reduced-motion`.

## Metadata

- Page title uses `{product.name} | 北京盛博润通信设备有限公司`.
- Meta description uses `product.productFeatures` when present, with a concise product-name fallback.
- Canonical URL remains `/{category-slug}/{product-slug}/`.

## Testing and Acceptance Criteria

Automated tests must verify:

- Published product detail routes no longer render `.foundation-placeholder`.
- Breadcrumb links point to `/products/`, the current category, and the current product.
- Desktop overview is two-column and the cover image is not cropped.
- Mobile overview is single-column and Feature layout is 2x2 when four Features exist.
- No more than four Features render, and each rendered Feature has a library-backed icon.
- Missing Feature mappings fail content validation with the product and Feature names in the message.
- Desktop displays the first parameter group by default.
- Mouse and keyboard input switch the selected desktop group and visible panel.
- Mobile hides group navigation and displays one merged table containing every Item in source order.
- Long parameter values do not cause horizontal overflow.
- Empty technical parameters render “技术参数整理中”.
- The inquiry CTA is centered, uses the required label, and renders without a link until contact navigation is approved.
- Existing category pages, product-card links, Header, Footer, and mobile Footer interaction continue to pass regression tests.

## Out of Scope

- Product image Gallery or thumbnail switching.
- Product comparison, downloads, inquiry forms, or direct messaging.
- Changes to category and product route structure.
- Redesigning the existing Header, Footer, category pages, or `/products/` overview.
- Displaying more than the first four Features in the overview.
