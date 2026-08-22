import { expect, test } from '@playwright/test';

test('serves the initial Shengborun homepage', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    '北京盛博润通信设备有限公司',
  );
  await expect(
    page.getByRole('heading', { level: 1, name: '让关键通信始终可靠' }),
  ).toBeVisible();
});

test('serves the company mark favicon', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/favicon.ico',
  );

  const response = await request.get('/favicon.ico');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/');
  expect((await response.body()).byteLength).toBeGreaterThan(0);
});

test('uses a white rounded tile behind the favicon mark', async ({ page }) => {
  await page.goto('/');

  const samples = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/brand/favicon-source.png';
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D context is unavailable');
    context.drawImage(image, 0, 0);

    const sample = (x: number, y: number) =>
      Array.from(context.getImageData(x, y, 1, 1).data);

    return {
      corner: sample(0, 0),
      topCenter: sample(canvas.width / 2, 32),
    };
  });

  expect(samples.corner[3]).toBe(0);
  expect(samples.topCenter).toEqual([255, 255, 255, 255]);
});
