# Homepage Card Image Height Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shorten the product-center and industry-solution card images uniformly by changing their shared image ratio from `16 / 10` to `2 / 1`.

**Architecture:** Both homepage sections already render the same `.image-card` structure and share one `.image-card img` rule in `src/pages/index.astro`. Keep that shared boundary and change only its `aspect-ratio`; add a focused browser regression test that measures the rendered image boxes at desktop and mobile widths.

**Tech Stack:** Astro 6, scoped component CSS, TypeScript, Playwright

## Global Constraints

- Preserve the existing width rule `width: 100%` and cropping rule `object-fit: cover`; add `height: auto` so the HTML height attribute does not keep the image at 1080px.
- Apply the same `2 / 1` ratio on desktop, tablet, and mobile.
- Do not change card widths, grid columns, text content height, spacing, radii, shadows, interactions, homepage data, or image assets.
- Preserve all pre-existing uncommitted changes in `src/pages/index.astro`.

---

### Task 1: Shorten Shared Homepage Card Images

**Files:**
- Create: `tests/e2e/homepage-card-layout.spec.ts`
- Modify: `src/pages/index.astro:328`

**Interfaces:**
- Consumes: The shared `.image-card img` scoped CSS rule used by both `productCategories` and `solutions` cards.
- Produces: A `2 / 1` image viewport with full card width and `cover` cropping on every breakpoint.

- [ ] **Step 1: Write the failing regression test**

Create `tests/e2e/homepage-card-layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`uses compact product and solution card images on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    const sections = [
      page.locator('section[aria-labelledby="products-title"]'),
      page.locator('section[aria-labelledby="solutions-title"]'),
    ];

    for (const section of sections) {
      const imageMetrics = await section.locator('.image-card img').first().evaluate((image) => {
        const box = image.getBoundingClientRect();
        const styles = getComputedStyle(image);
        return {
          aspectRatio: styles.aspectRatio,
          height: box.height,
          objectFit: styles.objectFit,
          width: box.width,
        };
      });

      expect(imageMetrics.objectFit).toBe('cover');
      expect(
        imageMetrics.width / imageMetrics.height,
        JSON.stringify(imageMetrics),
      ).toBeCloseTo(2, 1);
    }
  });
}
```

- [ ] **Step 2: Run the targeted test and verify it fails**

Run:

```powershell
pnpm run build
.\node_modules\.bin\playwright.CMD test tests/e2e/homepage-card-layout.spec.ts
```

Expected: both cases FAIL because the rendered ratio is approximately `1.6`, not `2.0`.

- [ ] **Step 3: Implement the minimal CSS change**

In `src/pages/index.astro`, replace the existing shared rule with:

```css
.image-card img { width: 100%; height: auto; aspect-ratio: 2 / 1; object-fit: cover; }
```

Do not alter any other line in the file.

- [ ] **Step 4: Run the targeted test and verify it passes**

Run:

```powershell
pnpm run build
.\node_modules\.bin\playwright.CMD test tests/e2e/homepage-card-layout.spec.ts
```

Expected: PASS with two passing tests.

- [ ] **Step 5: Run project verification**

Run:

```powershell
pnpm run check
```

Expected: the command exits successfully. Do not run the unrelated stale unit tests identified during baseline verification.

- [ ] **Step 6: Review the final diff without absorbing user changes**

Run:

```powershell
git diff -- src/pages/index.astro tests/e2e/homepage-card-layout.spec.ts
git status --short
```

Expected: the new test is untracked, the homepage retains its pre-existing user edits, and the only new homepage change is `aspect-ratio: 16 / 10` to `aspect-ratio: 2 / 1`. Do not stage or commit `src/pages/index.astro`, because it contains the user's other uncommitted changes.
