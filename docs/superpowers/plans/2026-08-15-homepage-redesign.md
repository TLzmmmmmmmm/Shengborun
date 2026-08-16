# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Chinese homepage from the supplied design using the supplied imagery, the site's real product/solution/support taxonomy, and working links to existing routes.

**Architecture:** Keep the existing `BaseLayout`, shared header, shared footer, design tokens, and Astro content collections. Add a homepage-focused data module so card copy and destinations remain readable, then compose the full page in `src/pages/index.astro` with real raster assets and Lucide icons.

**Tech Stack:** Astro 6, TypeScript, scoped Astro CSS, `@lucide/astro`, existing content collections.

## Global Constraints

- The supplied homepage screenshot is the visual reference for section order, card structure, spacing hierarchy, and overall appearance.
- Use only Chinese visible copy.
- Product cards are 对讲机通信、短波通信、自组网通信、ICT 集成.
- Solution cards are 酒店行业、企事业单位、石油石化、人防行业.
- Support items are 方案设计、交付培训、项目施工.
- Hero and CTA buttons use the confirmed destinations; cards link to their real existing routes.
- Partner logos are exact crops from the existing 2026 authorization certificates, not generated replacements.
- Do not add new routes.
- Do not run QA, automated tests, checks, builds, or other verification; the user will test manually.

---

### Task 1: Homepage asset library

**Files:**
- Create: `public/images/home/hero.png`
- Create: `public/images/home/cta.png`
- Create: `public/images/home/products/two-way-radio.png`
- Create: `public/images/home/products/shortwave.png`
- Create: `public/images/home/products/mesh-network.png`
- Create: `public/images/home/products/ict-integration.png`
- Create: `public/images/home/solutions/hotel.png`
- Create: `public/images/home/solutions/enterprise.png`
- Create: `public/images/home/solutions/petrochemical.png`
- Create: `public/images/home/solutions/civil-defense.png`

**Interfaces:**
- Consumes: the ten user-supplied image files in `C:/Users/Lenovo/Desktop/首页/`.
- Produces: stable public URLs under `/images/home/` for the homepage data module.

- [x] **Step 1: Create the homepage asset directories**

Create `public/images/home/products`, `public/images/home/solutions`, and `public/images/home/partners`.

- [x] **Step 2: Copy and normalize the supplied filenames**

Copy the original raster files byte-for-byte into the paths listed above, preserving their image content and dimensions.

### Task 2: Partner logo crops

**Files:**
- Create: `public/images/home/partners/motorola.png`
- Create: `public/images/home/partners/hytera.png`
- Create: `public/images/home/partners/huawei.png`
- Create: `public/images/home/partners/h3c.png`
- Create: `public/images/home/partners/codan.png`

**Interfaces:**
- Consumes: the five certificate images in `public/images/about/certificates/`.
- Produces: exact, non-generative logo crops used by the partner cards.

- [x] **Step 1: Measure each certificate logo region**

Inspect the five certificates and record a tight crop that contains the full logo with a small safe margin and no authorization body copy.

- [x] **Step 2: Export deterministic PNG crops**

Crop the Motorola Solutions, Hytera, Huawei, H3C, and Codan Radio Communications marks without stretching or redrawing them.

### Task 3: Homepage content model

**Files:**
- Create: `src/data/homepage.ts`

**Interfaces:**
- Consumes: public asset URLs, confirmed page destinations, and current product/solution/support routes.
- Produces: typed `productCategories`, `solutions`, `supportItems`, `benefits`, `reasons`, and `partners` arrays imported by the homepage.

- [x] **Step 1: Define typed homepage item interfaces**

Add focused interfaces for image cards, icon items, and partner marks so every rendered item has explicit copy, image alt text, and destination.

- [x] **Step 2: Add the confirmed homepage content**

Map the four products to `/{category-slug}/`, the four solutions to `/solutions/{solution-slug}/`, the three support items to their `/support/#...` anchors, and the five partners to their cropped logo assets.

### Task 4: Responsive homepage implementation

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: all exports from `src/data/homepage.ts`, shared `BaseLayout`, and Lucide Astro icon components.
- Produces: the finished `/` route.

- [x] **Step 1: Replace the product-list placeholder homepage**

Build the page in the reference order: Hero, product center, industry solutions, technical support, reasons to choose 盛博润, partners, and CTA.

- [x] **Step 2: Implement all confirmed interactions**

Use `/solutions/` and `/about/#contact` for the Hero buttons; use real card destinations; use `/support/` for the support link; and use `/about/#contact` for the CTA button.

- [x] **Step 3: Match the supplied desktop visual system**

Implement the screenshot's white/light-blue surfaces, dark navy headings, teal accents, fine borders, compact card shadows, restrained radii, and section spacing while inheriting existing global tokens.

- [x] **Step 4: Add responsive layout rules**

Collapse four-column card grids to two and then one column, stack Hero content safely over the image's light left side, keep card images consistently cropped, and make CTA copy readable at mobile widths.

### Task 5: Manual-test handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-08-15-homepage-redesign.md`

**Interfaces:**
- Consumes: completion state from Tasks 1–4.
- Produces: a concise list of changed files and the local homepage destination for the user's manual review.

- [x] **Step 1: Mark completed implementation steps**

Update this plan's checkboxes to reflect the work performed without running any automated test, build, browser QA, or screenshot comparison.

- [ ] **Step 2: Hand the homepage to the user**

Report the implemented sections, asset locations, and confirmed links, and explicitly state that testing was intentionally left to the user.
