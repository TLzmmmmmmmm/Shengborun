# Product Category Pages Design

**Date:** 2026-08-13  
**Status:** Approved design, awaiting implementation plan  
**Routes:** `/{category-slug}/`

## Objective

Replace the four category-page placeholders with a shared category-page design that provides clear category switching, retains the existing category banners, and lists every published product in the current category. The homepage product presentation and `/products/` overview remain independent.

## Page Structure

Each category page renders the following sequence:

1. Site header.
2. Breadcrumb: `首页 / 产品中心 / 当前分类`.
3. Current category title and approved description.
4. Four-item category navigation.
5. Current category banner.
6. `产品系列` heading without supporting description.
7. Product grid or empty state.
8. Site footer.

The breadcrumb is visually subdued through smaller, lighter text. The category title remains the dominant heading. The gap between the title/description block and category navigation is deliberately larger than the gap between ordinary page elements.

## Approved Category Content

The category order and descriptions are shared with `/products/`:

1. `对讲机通信` — `专业可靠的即时通信设备，满足多场景协同需求。`
2. `短波通信` — `面向远距离与复杂环境的稳定通信系统。`
3. `自组网通信` — `快速部署、多节点协同的无线组网设备。`
4. `ICT 集成` — `融合网络、计算、安全与通信的一体化基础设施。`

The category content JSON files are the canonical source for these descriptions. `/products/` and category pages must not maintain competing copies without a shared source or an automated consistency check.

## Category Navigation

Create one reusable `CategoryNavigation` component shared by all four category pages.

Each entry contains:

- A circular outline containing a meaningful icon.
- The category name.
- A link to the corresponding root-level category URL.

Icon meanings:

- Two-way radio: a simple, direct radio icon rather than a detailed illustrated handset.
- Shortwave radio: a radio-tower or broadcast icon.
- Mesh network: a connected-node/network icon.
- ICT integration: a server or infrastructure icon.

The current category uses `aria-current="page"` and three restrained visual signals:

- Teal circular outline.
- Teal label.
- A centered teal underline below the label, approximately half the label width.

The underline must not span the full navigation item.

### Responsive Navigation

- Desktop: four evenly distributed items with generous spacing and larger icon circles.
- Standard mobile around 390 px: all four items remain visible in one row by reducing circle, icon, label, and gap sizes.
- Very narrow screens: automatically switch to a 2 × 2 grid when a single row can no longer preserve complete Chinese labels and usable spacing.
- Horizontal scrolling is never used.

## Category Banner

Create a reusable `CategoryBanner` component, or an equivalently focused banner unit, that consumes the original category banner path, alt text, and per-category focal position.

- Continue using the existing root assets such as `public/images/products/two-way-radio-banner.png`.
- Do not replace these banners with `/products/` category-card images.
- Desktop aspect ratio: `5 / 2`.
- Mobile aspect ratio: `16 / 7`.
- Use `object-fit: cover`.
- Allow each category to define its own `object-position` so key equipment remains visible.

The banner is followed by the `产品系列` heading. There is no descriptive paragraph between the banner and product grid on either desktop or mobile.

## Product Data Migration

The category pages use formal JSON product records only.

Delete the three obsolete Markdown sample records:

- `src/content/products/ly198.md`
- `src/content/products/sample-radio.md`
- `src/content/products/product-sample-03.md`

Update the Astro products collection to load JSON files from the nested product-category directories. Do not retain Markdown or MDX loading as a compatibility path.

For the current category, render every product satisfying both conditions:

- `published === true`
- `categoryId === currentCategory.id`

Sort by `sortOrder` ascending, then `id` ascending as a deterministic tie-breaker. Do not paginate or impose a display limit on category pages. Homepage selection remains separate and may continue to limit its product count.

## Product Card

Extend the existing `ProductCard` rather than creating a competing category-only card.

The component accepts the existing product identity, image, alt text, and URL plus an optional feature summary. For category pages, the summary is derived from the first two non-empty `keyFeatures`. It is rendered as ordinary text, not colored badges, and is visually limited to two lines. If no feature exists, the summary region is omitted.

The entire card is one semantic link. Do not place a second nested link inside it. The visible `查看详情 →` text remains as an affordance within the full-card link. Keyboard focus must be clearly visible.

### Desktop Product Cards

- Three columns per row.
- Preserve the existing square-card visual direction.
- Product image above and information below.
- Use the existing site radius, divider, shadow, and teal interaction tokens.

### Mobile Product Cards

- One card per row.
- Horizontal rectangular layout.
- Product image on the left, approximately 38% of card width.
- Name, optional feature summary, and `查看详情 →` on the right, approximately 62% of card width.
- Card spacing and full-card hit area must remain comfortable for touch.

The simple grid wrapper remains in the category page. Do not create a separate `ProductGrid` component.

## Component Boundaries

- `CategoryNavigation`: category switching, current-state semantics, and responsive navigation layout only.
- `CategoryBanner`: banner aspect ratios, cropping, alt text, and focal position only.
- `ProductCard`: one product's image, name, optional summary, CTA affordance, and full-card interaction.
- `CategorySection`: continues to compose the homepage presentation and must not absorb category-page branching.
- `src/pages/[category]/index.astro`: category-page composition, all-products query, product grid, and empty state.

This structure deliberately avoids a `variant="homepage | category"` mode on `CategorySection`, which would couple two independently evolving page designs.

## Empty State

If a published category has no published products, retain the full breadcrumb, title, navigation, banner, and `产品系列` heading. Under the heading, display:

`产品资料整理中`

Do not render placeholder product cards.

## Accessibility and Interaction

- Category navigation is a labeled navigation region containing ordinary links.
- The active category uses `aria-current="page"`.
- Product cards are single semantic links with clear accessible names.
- Images retain useful alternative text and lazy loading where appropriate.
- All interactive elements have visible keyboard focus.
- Reduced-motion preferences are respected for any hover movement.
- No layout introduces horizontal page overflow.

## Verification Criteria

Automated and browser verification must establish:

- All four category URLs build successfully.
- Breadcrumbs read `首页 / 产品中心 / 当前分类`.
- Navigation order, URLs, icons, and active state are correct.
- Active underlines are centered and approximately half the text width.
- Standard mobile shows four navigation items in one row; very narrow mobile switches to 2 × 2; neither scrolls horizontally.
- Original `*-banner.png` files are used.
- Banner ratios are `5 / 2` desktop and `16 / 7` mobile, with acceptable category-specific crops.
- Desktop product grids use three square cards per row.
- Mobile cards use a left-image/right-content rectangular layout.
- Every card is fully clickable and has no nested link.
- Category pages show all and only published JSON products in deterministic order.
- Feature summaries contain no more than two `keyFeatures` and are presented as plain text.
- The empty state appears when appropriate.
- Homepage `CategorySection` presentation remains functional and visually unchanged except for intentional shared `ProductCard` internals that preserve its current output.
- The old Markdown sample records are absent and the content collection loads JSON product records without duplicate-ID conflicts.

## Out of Scope

- Product-detail page design.
- Product filtering, search, pagination, or sorting controls.
- Colored feature badges on category cards.
- Changes to category URL structure.
- Replacement of existing category banner assets.
- Changes to `/products/` overview layout.

## Approved Layout Revision — 2026-08-13

This revision supersedes the earlier category-page measurements where they differ.

- `/products/` and all four root category pages use the homepage content width: `max-width: 100rem`.
- Product overview and category page titles and descriptions are centered at desktop and mobile widths.
- Category navigation icon circles and glyphs increase by 100% on desktop.
- At mobile widths they increase by 50% from the previous mobile values while keeping four items in one row at 390 px.
- At 320 px the navigation remains 2 × 2.
- Category banners use a 3:1 aspect ratio at all breakpoints.
- The “产品系列” heading is removed. Product cards follow the banner with normal section spacing.

## Approved Responsive Detail Revision — 2026-08-13

- Desktop category navigation circles and glyphs scale continuously with viewport width, following the uploaded reference proportion; they are not fixed-size.
- Desktop product key features remain visibly rendered as the viewport narrows above the mobile breakpoint.
- Desktop “查看详情” occupies approximately one third of the product card width while the full card remains the only link.
- Mobile “查看详情” uses the same font size as key features.
- Mobile key features use ` · ` as the separator.
- Mobile breadcrumbs above the page footer and below the header use the same 14px size as mobile footer detail links.
- Mobile footer groups visually collapse and expand; the `hidden` state must not be overridden by list display CSS.
