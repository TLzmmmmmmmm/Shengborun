import { expect, test } from '@playwright/test';

const categoryLinks = [
  ['对讲机通信', '/two-way-radio/'],
  ['短波通信', '/shortwave-radio/'],
  ['自组网通信', '/mesh-network/'],
  ['ICT 集成', '/ict-integration/'],
] as const;

test.describe('product category pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/two-way-radio/');
  });

  test('renders the approved hierarchy, navigation and original banner', async ({ page }) => {
    await expect(page.locator('.foundation-placeholder')).toHaveCount(0);
    const breadcrumb = page
      .getByRole('main')
      .getByRole('navigation', { name: '面包屑' });
    await expect(breadcrumb).toContainText('首页');
    await expect(breadcrumb.getByRole('link', { name: '产品中心' })).toHaveAttribute(
      'href',
      '/products/',
    );
    await expect(breadcrumb).toContainText('对讲机通信');

    await expect(page.getByRole('heading', { name: '对讲机通信', level: 1 })).toBeVisible();
    await expect(page.locator('[data-category-description]')).toHaveText(
      '专业可靠的即时通信设备，满足多场景协同需求。',
    );
    await expect(page.locator('.category-header')).toHaveCSS('text-align', 'center');

    const navigation = page.getByRole('navigation', { name: '产品分类' });
    const links = navigation.getByRole('link');
    await expect(links).toHaveCount(4);
    for (const [index, [name, href]] of categoryLinks.entries()) {
      await expect(links.nth(index)).toContainText(name);
      await expect(links.nth(index)).toHaveAttribute('href', href);
      await expect(links.nth(index).locator('[data-category-icon]')).toBeVisible();
    }
    await expect(links.nth(0)).toHaveAttribute('aria-current', 'page');
    await expect(links.nth(1)).not.toHaveAttribute('aria-current', 'page');

    const banner = page.locator('[data-category-banner]');
    await expect(banner).toHaveAttribute(
      'src',
      '/images/products/two-way-radio-banner.png',
    );
    await expect(page.getByRole('heading', { name: '产品系列' })).toHaveCount(0);
    await expect(page.locator('[data-product-series-description]')).toHaveCount(0);
  });

  test('lists every published JSON product as one full-card link', async ({ page }) => {
    const cards = page.locator('[data-product-card]');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toContainText('润信达 LY198');
    await expect(cards.nth(1)).toContainText('润信达 LY298');
    await expect(cards.nth(2)).toContainText('润信达 LY598');
    await expect(cards.nth(3)).toContainText('润信达 LY598 键盘');

    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute('href', /\/two-way-radio\/.+\/$/);
      await expect(card.locator('a')).toHaveCount(0);
      await expect(card).toContainText('查看详情');
      await expect(card.locator('[data-product-feature]')).toHaveCount(2);
    }
  });

  test('navigates through category and product cards without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page
      .getByRole('navigation', { name: '产品分类' })
      .getByRole('link', { name: '短波通信' })
      .click();
    await expect(page).toHaveURL(/\/shortwave-radio\/$/);

    await page.goto('/two-way-radio/');
    await page.locator('[data-product-card]').first().click();
    await expect(page).toHaveURL(/\/two-way-radio\/ly198\/$/);
    expect(consoleErrors).toEqual([]);
  });

  test('uses desktop banner and three-column square cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    const bannerBox = await page.locator('[data-category-banner]').boundingBox();
    expect(bannerBox).not.toBeNull();
    expect(Math.abs((bannerBox!.width / bannerBox!.height) - 3)).toBeLessThan(0.03);

    const boxes = await page.locator('[data-product-card]').evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
    );
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[1].y).toBe(boxes[2].y);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[1].x).toBeLessThan(boxes[2].x);
    expect(Math.abs(boxes[0].width - boxes[0].height)).toBeLessThan(1);

    if (process.env.CAPTURE_CATEGORY === '1') {
      await page.screenshot({
        path: 'docs/design-previews/product-category-pages/category-desktop-1440x900.png',
        fullPage: false,
      });
    }
  });

  test('matches the homepage content width at wide desktop sizes', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    const categoryWidth = await page.locator('.category-content').evaluate(
      (element) => element.getBoundingClientRect().width,
    );

    await page.goto('/');
    const homepageWidth = await page.locator('.products-content').evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(categoryWidth).toBe(homepageWidth);
  });

  test('scales desktop category rings with their columns and keeps glyphs proportional', async ({ page }) => {
    const widths: number[] = [];
    for (const viewportWidth of [800, 1024, 1440]) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      await page.reload();
      const link = page
        .getByRole('navigation', { name: '产品分类' })
        .getByRole('link')
        .first();
      const ringBox = (await link.locator('[data-category-icon]').boundingBox())!;
      const glyphBox = (await link.locator('svg').boundingBox())!;
      widths.push(ringBox.width);
      expect(ringBox.width).toBeLessThanOrEqual(144.5);
      expect(glyphBox.width / ringBox.width).toBeGreaterThan(0.38);
      expect(glyphBox.width / ringBox.width).toBeLessThan(0.42);
    }
    expect(widths[0]).toBeLessThan(widths[1]);
    expect(widths[1]).toBeLessThanOrEqual(widths[2]);
    expect(widths[2]).toBeLessThanOrEqual(144.5);
  });

  test('keeps complete desktop features visible and sizes the CTA like supporting text', async ({ page }) => {
    for (const viewportWidth of [800, 900, 1024, 1200, 1440]) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      await page.reload();
      const card = page.locator('[data-product-card]').first();
      const features = card.locator('.product-features');
      await expect(features).toBeVisible();
      const isClipped = await features.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const childrenFit = Array.from(element.children).every((child) => {
          const childBounds = child.getBoundingClientRect();
          return (
            child.scrollWidth <= child.clientWidth &&
            childBounds.left >= bounds.left - 0.5 &&
            childBounds.right <= bounds.right + 0.5
          );
        });
        return !childrenFit || element.scrollHeight > element.clientHeight;
      });
      expect(isClipped, `features are clipped at ${viewportWidth}px`).toBe(false);
      const featureFontSize = await features.evaluate(
        (element) => getComputedStyle(element).fontSize,
      );
      await expect(card.locator('.product-cta')).toHaveCSS('font-size', featureFontSize);
    }
    if (process.env.CAPTURE_CATEGORY === '1') {
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.reload();
      await page.screenshot({
        path: 'docs/design-previews/product-category-pages/category-desktop-1024x900.png',
        fullPage: true,
      });
    }
  });

  test('keeps four navigation items in one row and uses horizontal cards at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const navBoxes = await page
      .getByRole('navigation', { name: '产品分类' })
      .getByRole('link')
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().y));
    expect(new Set(navBoxes.map(Math.round)).size).toBe(1);

    const bannerBox = await page.locator('[data-category-banner]').boundingBox();
    expect(Math.abs((bannerBox!.width / bannerBox!.height) - 3)).toBeLessThan(0.03);

    const iconRing = page.locator('[data-category-icon]').first();
    const iconBox = await iconRing.boundingBox();
    const glyphBox = await iconRing.locator('svg').boundingBox();
    expect(iconBox!.width).toBeCloseTo(69, 0);
    expect(glyphBox!.width).toBeCloseTo(32, 0);
    await expect(page.locator('.category-header')).toHaveCSS('text-align', 'center');

    const card = page.locator('[data-product-card]').first();
    const separator = await card.locator('[data-product-feature]').nth(1).evaluate(
      (element) => getComputedStyle(element, '::before').content,
    );
    expect(separator).toContain(' · ');
    const featureFontSize = await card.locator('.product-features').evaluate(
      (element) => getComputedStyle(element).fontSize,
    );
    await expect(card.locator('.product-cta')).toHaveCSS('font-size', featureFontSize);

    const mainBreadcrumb = page
      .getByRole('main')
      .getByRole('navigation', { name: '面包屑' });
    const footerBreadcrumb = page
      .getByRole('contentinfo')
      .getByRole('navigation', { name: '面包屑' });
    await expect(mainBreadcrumb).toHaveCSS('font-size', '14px');
    await expect(footerBreadcrumb).toHaveCSS('font-size', '14px');

    const cardBox = await card.boundingBox();
    const mediaBox = await card.locator('[data-product-media]').boundingBox();
    const contentBox = await card.locator('[data-product-content]').boundingBox();
    expect(cardBox!.width).toBeGreaterThan(cardBox!.height);
    expect(mediaBox!.x).toBeLessThan(contentBox!.x);
    expect(mediaBox!.width / cardBox!.width).toBeGreaterThan(0.32);
    expect(mediaBox!.width / cardBox!.width).toBeLessThan(0.44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

    if (process.env.CAPTURE_CATEGORY === '1') {
      await page.screenshot({
        path: 'docs/design-previews/product-category-pages/category-mobile-390x844.png',
        fullPage: false,
      });
    }
  });

  test('switches category navigation to 2 by 2 on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.reload();

    const navYs = await page
      .getByRole('navigation', { name: '产品分类' })
      .getByRole('link')
      .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().y)));
    expect(new Set(navYs).size).toBe(2);
    expect(navYs[0]).toBe(navYs[1]);
    expect(navYs[2]).toBe(navYs[3]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

    if (process.env.CAPTURE_CATEGORY === '1') {
      await page.screenshot({
        path: 'docs/design-previews/product-category-pages/category-narrow-320x800.png',
        fullPage: false,
      });
    }
  });
});

test('keeps product detail routes as BaseLayout placeholders', async ({ page }) => {
  await page.goto('/two-way-radio/ly198/');
  await expect(page.locator('.foundation-placeholder')).toBeVisible();
  await expect(page.getByRole('heading', { name: '润信达 LY198' })).toBeVisible();
  const breadcrumb = page
    .getByRole('contentinfo')
    .getByRole('navigation', { name: '面包屑' });
  await expect(breadcrumb.getByRole('link', { name: '产品中心' })).toHaveAttribute(
    'href',
    '/products/',
  );
  await expect(breadcrumb.getByRole('link', { name: '对讲机通信' })).toHaveAttribute(
    'href',
    '/two-way-radio/',
  );
  await expect(page.locator('[data-product-detail]')).toHaveCount(0);
});
