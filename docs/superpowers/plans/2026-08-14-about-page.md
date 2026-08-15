# About Page Implementation Plan

> **For agentic workers:** Execute inline in the current worktree. The user explicitly requested no new tests for this page.

**Goal:** Replace the `/about` placeholder with a responsive About page grounded in the supplied design image, current site shell, latest company copy, contact details, and five 2026 authorization certificates.

**Architecture:** Keep the existing `BaseLayout`, shared Header, shared Footer, tokens, and breadcrumb behavior. Implement the page as a focused Astro page with local data arrays for certificates and contact items, using the installed icon components and supplied raster assets. Scope styles to the page and preserve unrelated product-detail worktree changes.

**Tech Stack:** Astro, scoped CSS, `@lucide/astro`, supplied JPG assets.

## Current Checkpoint — 2026-08-15

- Page implementation and asset copying are complete.
- Astro diagnostics pass with zero errors, warnings, or hints.
- `/about/index.html` is generated successfully; the full-site build then stops on pre-existing unknown ICT product-feature data outside this page.
- The local About preview is running for user review. Automated screenshot comparison is blocked because no in-app screenshot capture is available and Playwright was not authorized.
- Existing unrelated product content remains untouched.

## Global Constraints

- Preserve the current global Header and Footer; do not recreate the screenshot's older shell.
- Use the exact content from `公司介绍.docx` and `联系我们.docx`.
- Show all five supplied 2026 authorization certificates.
- Do not create or modify test files.
- Do not stage, commit, or alter unrelated worktree changes.

---

### Task 1: Add About-page certificate assets

**Files:**
- Create: `public/images/about/certificates/hytera-authorization-2026.jpg`
- Create: `public/images/about/certificates/h3c-authorization-2026.jpg`
- Create: `public/images/about/certificates/huawei-authorization-2026.jpg`
- Create: `public/images/about/certificates/codan-authorization-2026.jpg`
- Create: `public/images/about/certificates/motorola-authorization-2026.jpg`

- [x] Copy the five supplied source images without recompression or cropping.
- [x] Confirm every destination file exists and preserves its source dimensions.

### Task 2: Implement the responsive About page

**Files:**
- Modify: `src/pages/about.astro`

- [x] Replace placeholder content with the page heading and short lead.
- [x] Add the `#company` section with all four approved company-introduction paragraphs.
- [x] Add the `#qualifications` section with five labeled certificate cards and links to full-size source images.
- [x] Add the `#contact` section with company names, clickable telephone, mobile/WeChat, email, website, and address.
- [x] Use the installed outline icon components for contact details.
- [x] Match the reference's white surfaces, teal section bars, restrained dividers, typography hierarchy, card borders, and generous vertical rhythm.
- [x] Add responsive behavior: five certificate columns on wide screens, three/two columns at medium widths, and one column on narrow phones.

### Task 3: Validate and visually review

**Files:**
- Create or update: `design-qa.md`

- [x] Run page diagnostics and generate `/about/index.html` without adding tests.
- [x] Open `/about/` locally in the Codex browser for user review.
- [ ] Inspect a mobile viewport for overflow, certificate sizing, and contact readability.
- [ ] Compare the reference and implementation in one visual input and record a passed result.
