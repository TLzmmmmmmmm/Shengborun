# Product Short Description Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `shortDescription` from the strict product content contract, migrate the sample product, and align project documentation without changing the separate product-category summary field.

**Architecture:** Treat the schema, checked-in sample content, tests, and authoring documentation as one atomic content-model migration so every committed state remains buildable. Keep `productCategorySchema.shortDescription` intact, and use the product schema's existing `.strict()` behavior to reject legacy product data rather than silently ignoring it.

**Tech Stack:** Astro 6 content collections, Zod schemas, Markdown frontmatter, Vitest, Playwright, pnpm.

## Global Constraints

- This correction does not start Task 4 or add product pages or components.
- Remove `shortDescription` only from product entities; keep product-category `shortDescription` unchanged.
- Do not introduce or repurpose another field as a product-card summary.
- Future product cards and search results must not show a brief product introduction.
- Product detail pages may continue using `productFeatures` for complete feature text.
- Work and verification are local only at `http://127.0.0.1:4321`.
- Do not deploy, access or test the production domain, or modify DNS, HTTPS, or servers.
- Preserve unrelated user changes; do not reset, overwrite, or delete them.

---

## File Structure

- Modify `tests/unit/content-schema.test.ts`: encode the removed product field and preserved category field as regression behavior.
- Modify `src/lib/content-rules.ts`: remove the product-only Zod field while retaining strict-object validation and the category field.
- Modify `src/content/products/sample-radio.md`: migrate the checked-in sample product to the revised contract.
- Modify `SiteMap.md`: remove the product field and its product-list summary semantics from the authoritative content model.
- Modify `docs/superpowers/plans/2026-08-08-shengborun-static-site.md`: correct the original Task 2 schema example and Task 4 card requirement.
- Modify `docs/PROJECT_STATUS.md`: record the content-model correction and link the new design and plan for future handoff.

---

### Task 1: Migrate The Product Content Contract

**Files:**
- Modify: `tests/unit/content-schema.test.ts:38-67`
- Modify: `src/lib/content-rules.ts:23-81`
- Modify: `src/content/products/sample-radio.md:1-7`
- Modify: `SiteMap.md:84-105`
- Modify: `docs/superpowers/plans/2026-08-08-shengborun-static-site.md:209-220,384-390`
- Modify: `docs/PROJECT_STATUS.md:3-16,90-116`

**Interfaces:**
- Consumes: exported `productSchema` and `productCategorySchema` from `src/lib/content-rules.ts`.
- Produces: a strict `productSchema` that accepts products without `shortDescription` and rejects products containing that legacy key; `productCategorySchema` continues accepting its optional string `shortDescription`.
- Preserves: all other product fields, product/category relationships, tag-color rules, routes, and Task 4 boundaries.

- [ ] **Step 1: Write the failing regression test**

Add this focused test after the existing approved-product-fields test in `tests/unit/content-schema.test.ts`:

```ts
it('rejects product shortDescription while preserving category summaries', () => {
  const productResult = productSchema.safeParse({
    id: 'radio-sample',
    name: '示例数字对讲机',
    slug: 'sample-radio',
    categoryId: 'two-way-radio',
    shortDescription: '适用于日常调度与现场协作的示例数字对讲机，支持稳定清晰的语音通信。',
    coverImage: '/images/products/sample-radio.svg',
    published: true,
  });
  const categoryResult = productCategorySchema.safeParse({
    id: 'two-way-radio',
    name: '对讲机通信',
    slug: 'two-way-radio',
    shortDescription: '产品类别可以继续保留简介。',
    published: true,
  });

  expect(productResult.success).toBe(false);
  expect(categoryResult.success).toBe(true);
});
```

- [ ] **Step 2: Run only the new test and verify RED**

Run:

```powershell
pnpm exec vitest run tests/unit/content-schema.test.ts -t "rejects product shortDescription while preserving category summaries"
```

Expected: FAIL because the current product schema still recognizes `shortDescription`, so `productResult.success` is `true`. The category assertion should already pass.

- [ ] **Step 3: Apply the minimal schema and fixture migration**

In `src/lib/content-rules.ts`, remove only this line from `productSchema`:

```ts
shortDescription: z.string().min(30).max(80),
```

Keep this separate line in `productCategorySchema` unchanged:

```ts
shortDescription: z.string().min(1).optional(),
```

Remove `shortDescription` from both existing product objects in `tests/unit/content-schema.test.ts`. Do not loosen `.strict()`, because strictness is what rejects the legacy key.

Remove this frontmatter entry from `src/content/products/sample-radio.md` without adding a replacement field:

```yaml
shortDescription: 适用于日常调度与现场协作的示例数字对讲机，支持稳定清晰的语音通信。
```

- [ ] **Step 4: Run the focused unit test file and verify GREEN**

Run:

```powershell
pnpm exec vitest run tests/unit/content-schema.test.ts
```

Expected: all tests in the file PASS. The new test proves product rejection and category preservation; the approved product fixture proves `shortDescription` is no longer required.

- [ ] **Step 5: Align the authoritative model and future Task 4 instructions**

In `SiteMap.md`:

- delete the product-field table row for `shortDescription`;
- replace the paragraph beginning with `` `shortDescription` 只负责`` with a paragraph that starts `` `productFeatures` 用于详情页的完整说明。`` and preserves the existing document-to-product relationship explanation;
- do not alter the category-field contract.

In `docs/superpowers/plans/2026-08-08-shengborun-static-site.md`:

- delete `shortDescription: z.string().min(30).max(80),` from the Task 2 product schema example;
- change the Task 4 requirement `卡片使用 shortDescription` to `卡片不显示简短介绍` while preserving the published-product, generated-filter, empty-result, and reset-button requirements.

In `docs/PROJECT_STATUS.md`:

- update `最后更新` to `2026-08-11`;
- record that the product entity no longer contains `shortDescription`, the category entity remains unchanged, and future product cards do not show a brief introduction;
- add the design file `docs/superpowers/specs/2026-08-11-product-short-description-removal-design.md` and this implementation plan to the important-file list;
- keep Task 4 marked as not started and requiring user confirmation.

- [ ] **Step 6: Check the exact migration boundary**

Run:

```powershell
Get-ChildItem src,tests,docs -Recurse -File | Select-String -Pattern 'shortDescription'
Select-String -Path SiteMap.md -Pattern 'shortDescription'
```

Expected:

- no product schema, product fixture, sample product, SiteMap product-field, or future product-card reference remains;
- the category schema and `src/content/product-categories/two-way-radio.json` still contain `shortDescription`;
- the new regression test and historical correction documents may mention the removed product field intentionally.

- [ ] **Step 7: Run complete local verification**

Run each command separately:

```powershell
pnpm run test:unit
pnpm run validate:content
pnpm run check
pnpm run build
pnpm run test:e2e
git diff --check
git status --short --branch
```

Expected:

- all unit tests pass;
- content validation reports success;
- Astro check reports zero errors, warnings, and hints;
- the static build completes;
- all local end-to-end tests pass against the local preview process managed by Playwright;
- `git diff --check` is clean;
- only the six planned migration files are modified, with no unrelated changes.

- [ ] **Step 8: Review, stage, commit, and push**

Review the complete diff against `docs/superpowers/specs/2026-08-11-product-short-description-removal-design.md`, then run:

```powershell
git add tests/unit/content-schema.test.ts src/lib/content-rules.ts src/content/products/sample-radio.md SiteMap.md docs/superpowers/plans/2026-08-08-shengborun-static-site.md docs/PROJECT_STATUS.md
git commit -m "refactor: remove product short description field"
git push origin codex/site-foundation
git status --short --branch
```

Expected: commit and push succeed; the final status is clean and `codex/site-foundation` is synchronized with `origin/codex/site-foundation`. Stop and wait for user confirmation without starting Task 4.
