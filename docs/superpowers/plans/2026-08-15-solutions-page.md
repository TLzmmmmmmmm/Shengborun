# Solutions Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive six-card solutions index and six short-URL detail pages from the user-approved Word documents and supplied images.

**Architecture:** Astro's `solutions` content collection remains the single source for list and detail pages. Six Markdown entries hold frontmatter metadata plus complete structured body copy; one dynamic route renders all detail pages, while the index sorts and renders cards from the same collection.

**Tech Stack:** Astro 6, Astro content collections, Markdown, TypeScript, scoped Astro CSS.

## Global Constraints

- Use only the six user-supplied solution images.
- Render Chinese titles and copy only.
- Keep the confirmed solution order and short slugs: `hotel`, `enterprise`, `petrochemical`, `civil-defense`, `emergency-mesh`, `smart-emergency`.
- Detail pages must render the complete corresponding Word body.
- Do not add a contact CTA.
- Preserve unrelated working-tree changes and do not commit unless asked.
- Apply the two user-approved petrochemical wording corrections documented in `docs/superpowers/specs/2026-08-15-solutions-page-design.md`.

---

### Task 1: Define content metadata and import assets

**Files:**
- Modify: `src/lib/content-rules.ts`
- Create: `public/images/solutions/hotel.avif`
- Create: `public/images/solutions/enterprise.png`
- Create: `public/images/solutions/petrochemical.jpg`
- Create: `public/images/solutions/civil-defense.jpg`
- Create: `public/images/solutions/emergency-mesh.jpg`
- Create: `public/images/solutions/smart-emergency.jpg`

**Interfaces:**
- Consumes: the six supplied image files and existing `solutions` collection.
- Produces: `coverImage`, `coverImageAlt`, `coverImageWidth`, `coverImageHeight`, and optional `coverImagePosition` fields available on every solution entry.

- [ ] **Step 1:** Extend `solutionSchema` with required cover image source, alt text, intrinsic width, intrinsic height, and optional CSS object-position metadata while retaining the existing reusable SEO and publication fields.
- [ ] **Step 2:** Copy each supplied image into `public/images/solutions/` under its final short slug filename without recompressing or generating replacements.
- [ ] **Step 3:** Read intrinsic dimensions from the copied assets and store those exact values in the six content entries created in Task 2.

### Task 2: Replace the sample with six complete solution entries

**Files:**
- Delete: `src/content/solutions/sample-solution.md`
- Create: `src/content/solutions/hotel.md`
- Create: `src/content/solutions/enterprise.md`
- Create: `src/content/solutions/petrochemical.md`
- Create: `src/content/solutions/civil-defense.md`
- Create: `src/content/solutions/emergency-mesh.md`
- Create: `src/content/solutions/smart-emergency.md`

**Interfaces:**
- Consumes: the schema and images from Task 1 and the latest six Word documents.
- Produces: six published, sortable solution collection entries consumed by both routes.

- [ ] **Step 1:** Add frontmatter to each entry with its confirmed Chinese title, short slug, 1–2 sentence summary, image metadata, `sortOrder` from 1 through 6, `published: true`, and matching SEO title, description, path, and image.
- [ ] **Step 2:** Convert each Word document's full body into semantic Markdown headings, paragraphs, and numbered lists without summarizing or omitting body information.
- [ ] **Step 3:** Apply the approved petrochemical corrections and delete the placeholder sample entry.
- [ ] **Step 4:** Run `pnpm run validate:content` and require exit code 0.

### Task 3: Build the responsive solutions index

**Files:**
- Create: `src/components/solutions/SolutionCard.astro`
- Modify: `src/pages/solutions/index.astro`

**Interfaces:**
- Consumes: sorted published solution entries and their cover metadata.
- Produces: accessible linked cards leading to `/solutions/{slug}/`.

- [ ] **Step 1:** Implement `SolutionCard.astro` with a full-card link, responsive cover image, title, summary, “查看方案” label, hover elevation, and visible focus state.
- [ ] **Step 2:** Replace the placeholder index with Breadcrumbs, compact title/description content, and a sorted three-column grid that collapses to two and then one column.
- [ ] **Step 3:** Match the supplied design's restrained white cards, borders, radius, spacing, typography hierarchy, and teal interaction color while using existing design tokens.

### Task 4: Build the shared solution detail template

**Files:**
- Modify: `src/pages/solutions/[solution].astro`

**Interfaces:**
- Consumes: a full Astro content entry returned by `getStaticPaths()`.
- Produces: six static detail pages with correct metadata, breadcrumb paths, hero imagery, and rendered Markdown bodies.

- [ ] **Step 1:** Pass each full collection entry through static path props and call `render()` so Markdown content is available as an Astro `Content` component.
- [ ] **Step 2:** Implement the compact breadcrumb/title/summary hero and large supplied image using exact intrinsic dimensions and responsive cropping.
- [ ] **Step 3:** Implement a readable article container with scoped global styles for Markdown headings, paragraphs, and ordered/unordered lists; omit any CTA.

### Task 5: Verify content, routes, and presentation

**Files:**
- Create or update: `design-qa.md`

**Interfaces:**
- Consumes: all changes from Tasks 1–4 and the supplied design screenshot.
- Produces: evidence that content/type checks and core route behavior are valid, plus an explicit visual QA result or documented capture blocker.

- [ ] **Step 1:** Run `pnpm run validate:content` and `pnpm run check`; require both commands to exit successfully.
- [ ] **Step 2:** Attempt `pnpm run build`; if a pre-existing unrelated content error blocks it, record the exact first error without changing unrelated product data.
- [ ] **Step 3:** Start the local Astro preview, inspect `/solutions/` and all six short detail URLs, and verify that every card reaches the correct complete body.
- [ ] **Step 4:** Compare the implementation at the same viewport with the supplied reference screenshot and record layout, cropping, spacing, and typography findings in `design-qa.md`; fix all issues within the approved solutions scope, or mark visual comparison blocked if screenshot capture is unavailable.
