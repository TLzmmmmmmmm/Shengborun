# Product Feature Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register all 62 missing product Feature names with valid existing icons so every published product reference resolves successfully.

**Architecture:** Keep product JSON files unchanged and extend the single shared Feature library. The existing content reference validator provides the red/green verification, while the Astro schema verifies icon enum validity and duplicate-name checks verify library integrity.

**Tech Stack:** JSON, TypeScript validation, Astro content collections, pnpm.

## Global Constraints

- Modify only `src/content/product-features/features.json` as production content.
- Preserve every product `keyFeatures` string and order.
- Use only icon identifiers listed in `PRODUCT_FEATURE_ICONS`.
- Add exactly the 62 mappings approved in `docs/superpowers/specs/2026-08-15-product-feature-library-design.md`.
- Preserve unrelated working-tree changes and do not commit unless requested.

---

### Task 1: Extend the shared Feature library

**Files:**
- Modify: `src/content/product-features/features.json`

**Interfaces:**
- Consumes: product `keyFeatures` string references and the `ProductFeatureDefinition` shape `{ name: string; icon: ProductFeatureIcon }`.
- Produces: one exact-name library definition for every published product Feature.

- [ ] **Step 1: Confirm the existing failing reference check**

Run: `pnpm run validate:content`

Expected: exit code 1 with `Unknown product feature` entries, including `集中管理` and `Type-C充电`.

- [ ] **Step 2: Add the approved mappings**

Append the 62 exact `{ "name": "…", "icon": "…" }` objects from the approved design spec. Do not rename or delete the existing 34 entries.

- [ ] **Step 3: Verify the reference check turns green**

Run: `pnpm run validate:content`

Expected: exit code 0 and `Content references are valid.`

### Task 2: Verify library integrity and Astro compatibility

**Files:**
- Verify: `src/content/product-features/features.json`
- Verify: `src/lib/product-features.ts`

**Interfaces:**
- Consumes: the completed Feature library and `PRODUCT_FEATURE_ICONS` enum.
- Produces: evidence that names are unique, mappings are complete, and all icon identifiers are permitted.

- [ ] **Step 1: Check exact coverage and uniqueness**

Parse all published product JSON files and assert that every `keyFeatures` value occurs once in the Feature library, with zero duplicate library names.

- [ ] **Step 2: Check allowed icon identifiers**

Compare every library `icon` value with `PRODUCT_FEATURE_ICONS` and require zero invalid values.

- [ ] **Step 3: Run Astro diagnostics**

Run: `pnpm run check` with telemetry disabled in the restricted environment.

Expected: 0 errors, 0 warnings, 0 hints.

- [ ] **Step 4: Run whitespace validation**

Run: `git diff --check`

Expected: exit code 0; line-ending notices are informational only.
