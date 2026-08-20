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
