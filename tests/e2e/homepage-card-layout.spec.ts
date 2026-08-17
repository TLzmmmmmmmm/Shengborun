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
