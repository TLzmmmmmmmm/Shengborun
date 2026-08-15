# Support Page Implementation Plan

> **For agentic workers:** Execute inline in the current worktree. The user explicitly requested no test design or test implementation for this page.

**Goal:** Replace the `/support/` placeholder and six linked child routes with one responsive page containing three complete technical-support services.

**Architecture:** Store the three services in `src/data/support-services.ts` so the page and Footer share titles and anchors. Render the full service content in `src/pages/support/index.astro`, use three cleaned raster icon visuals with HTML overlay copy, and delete the dynamic child-page route.

**Tech Stack:** Astro, scoped CSS, supplied PNG assets, built-in image editing.

## Global Constraints

- Use the exact body text from the three supplied Word documents.
- Service order is 方案设计, 交付培训, 项目施工.
- Show Chinese only; do not render English subtitles.
- Service sections are not links.
- Delete the existing six support child pages.
- Update Footer links to the three `/support/#...` anchors.
- Do not create, modify, or run tests; the user will test the page.
- Preserve all unrelated About-page and product worktree changes.

---

### Task 1: Produce clean service visual assets

**Files:**
- Create: `public/images/support/solution-design.png`
- Create: `public/images/support/delivery-training.png`
- Create: `public/images/support/project-implementation.png`

- [x] Inspect each supplied annotated PNG as an edit target.
- [x] Remove red annotations, black arrows, old titles, and old descriptions while preserving the light gray background and original blue icon.
- [x] Save the three selected project-bound outputs under `public/images/support/` without overwriting the supplied source files.
- [x] Inspect the final outputs for clean icon edges, consistent color, and absence of annotation remnants.

### Task 2: Replace the service data model

**Files:**
- Modify: `src/data/support-services.ts`

- [x] Expand `SupportService` with `summary`, `body`, `image`, and `imageAlt` fields.
- [x] Replace the six legacy services with the three approved services and anchor hrefs:
  - `/support/#solution-design`
  - `/support/#delivery-training`
  - `/support/#project-implementation`
- [x] Insert the exact Word body text and approved visual summaries.

### Task 3: Build the single-page Support layout

**Files:**
- Modify: `src/pages/support/index.astro`

- [x] Replace the placeholder with a breadcrumb/header matching the approved reference hierarchy.
- [x] Render three non-clickable service sections from `supportServices`.
- [x] Alternate image/text placement on desktop and use image-first single-column order on mobile.
- [x] Place the exact Chinese title and summary as HTML in the visual panel above each cleaned icon asset.
- [x] Render the Chinese title and full Word body in the content panel without an English subtitle.
- [x] Add stable section IDs and scroll offsets for Footer anchors.

### Task 4: Remove child routes and synchronize navigation

**Files:**
- Delete: `src/pages/support/[service].astro`
- Verify: `src/components/layout/Footer.astro`

- [x] Delete the dynamic route so the six old service URLs are no longer generated.
- [x] Confirm the Footer reads the three new titles and anchor hrefs from `supportServices` without further hard-coded links.
- [x] Search source files for remaining legacy service route references outside tests; remove any obsolete production references.

### Task 5: Validate without tests

**Files:**
- Update: `docs/design-qa-support.md`

- [x] Run `astro check` and confirm the changed Astro/TypeScript files have no diagnostics.
- [x] Attempt `astro build`; record any pre-existing content error separately from Support-page results.
- [x] Confirm `/support/` and all three image resources return successfully in the local preview.
- [x] Record the implementation status and the user-owned final visual review; do not add or run tests.
