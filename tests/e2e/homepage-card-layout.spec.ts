import { expect, test } from '@playwright/test';

test('uses the approved compact desktop hero geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const hero = page.locator('.hero');
  const copy = page.locator('.hero-copy');
  const heroBox = await hero.boundingBox();
  const copyBox = await copy.boundingBox();

  expect(heroBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(heroBox!.height).toBeCloseTo(518.4, 0);
  expect(copyBox!.y - heroBox!.y).toBeLessThan(110);
});

test('uses the hero artwork as a full-bleed background', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const backgroundSize = await page.locator('.hero').evaluate(
    (element) => getComputedStyle(element).backgroundSize,
  );

  expect(backgroundSize).toBe('cover, cover');
});
