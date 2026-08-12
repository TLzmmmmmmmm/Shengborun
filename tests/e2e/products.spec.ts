import { expect, test } from '@playwright/test';

test.describe('products landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1600 });
    await page.goto('/products/');
  });

  test('uses the existing layout and approved introductory copy', async ({
    page,
  }) => {
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: '主导航' }).getByRole('link', {
        name: '产品中心',
        exact: true,
      }),
    ).toHaveAttribute('aria-current', 'page');

    await expect(
      page.getByRole('heading', { name: '产品中心', level: 1 }),
    ).toBeVisible();
    await expect(page.locator('[data-products-intro]')).toContainText(
      '专业的通信设备与解决方案，助力客户高效连接世界',
    );
    await expect(page.locator('[data-products-intro]')).not.toContainText(
      'URL /products/',
    );
    await expect(page.locator('[data-products-intro]')).not.toContainText(
      '世界。',
    );
  });

  test('shows the two-way-radio category with three ordered product cards', async ({
    page,
  }) => {
    const section = page.locator('[data-category-section="two-way-radio"]');
    await expect(
      section.getByRole('heading', { name: '对讲机通信', level: 2 }),
    ).toBeVisible();
    await expect(section.locator('[data-category-description]')).toHaveText(
      '专业可靠的便携通信产品，满足消防稳定的现场联络需求',
    );
    await expect(section.locator('[data-category-description]')).not.toContainText(
      '需求。',
    );

    const cards = section.locator('[data-product-card]');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('润信达 LY198');
    await expect(cards.nth(1)).toContainText('示例数字对讲机');
    await expect(cards.nth(2)).toContainText('产品样例 03');
    await expect(
      cards.nth(0).getByRole('img', {
        name: '润信达 LY198 模拟对讲机正面图',
      }),
    ).toBeVisible();

    await expect(cards.nth(0).getByRole('link', { name: '了解更多' })).toHaveAttribute(
      'href',
      '/products/two-way-radio/ly198/',
    );
    await expect(cards.nth(1).getByRole('link', { name: '了解更多' })).toHaveAttribute(
      'href',
      '/products/two-way-radio/sample-radio/',
    );
    await expect(cards.nth(2).getByRole('link', { name: '了解更多' })).toHaveAttribute(
      'href',
      '/products/two-way-radio/product-sample-03/',
    );

    await expect(section).not.toContainText('购买');
    await expect(section).not.toContainText('>');
    await expect(section).not.toContainText('本示例用于验证产品内容字段');

    const categoryLink = section.getByRole('link', {
      name: '了解更多对讲机通信产品',
    });
    await expect(categoryLink).toHaveAttribute(
      'href',
      '/products/two-way-radio/',
    );
    await expect(categoryLink).toHaveCSS('background-color', 'rgb(0, 154, 152)');
    await expect(categoryLink).toHaveCSS('color', 'rgb(29, 29, 31)');
  });

  test('aligns the desktop banner and square product grid', async ({ page }) => {
    const section = page.locator('[data-category-section="two-way-radio"]');
    const introTitle = page.getByRole('heading', { name: '产品中心', level: 1 });
    const introDescription = page.locator('[data-products-intro] p');
    const categoryTitle = section.getByRole('heading', {
      name: '对讲机通信',
      level: 2,
    });
    const categoryDescription = section.locator('[data-category-description]');
    const introBox = await page.locator('[data-products-intro]').boundingBox();
    const introTitleSize = Number.parseFloat(
      await introTitle.evaluate((heading) => getComputedStyle(heading).fontSize),
    );
    const introDescriptionSize = Number.parseFloat(
      await introDescription.evaluate((description) =>
        getComputedStyle(description).fontSize,
      ),
    );
    const categoryTitleSize = Number.parseFloat(
      await categoryTitle.evaluate((heading) => getComputedStyle(heading).fontSize),
    );
    const categoryDescriptionSize = Number.parseFloat(
      await categoryDescription.evaluate((description) =>
        getComputedStyle(description).fontSize,
      ),
    );
    const bannerBox = await section.locator('[data-category-banner]').boundingBox();
    const gridBox = await section.locator('[data-product-grid]').boundingBox();
    const categoryLink = section.getByRole('link', {
      name: '了解更多对讲机通信产品',
    });
    const categoryLinkBox = await categoryLink.boundingBox();
    const cardBoxes = await section.locator('[data-product-card]').evaluateAll((cards) =>
      cards.map((card) => {
        const box = card.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );

    expect(introBox).not.toBeNull();
    expect(introBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThan(250);
    expect(introTitleSize).toBe(24);
    expect(introDescriptionSize).toBe(19);
    expect(categoryTitleSize).toBe(20);
    expect(categoryDescriptionSize).toBe(16);
    expect(bannerBox).not.toBeNull();
    expect(gridBox).not.toBeNull();
    expect(categoryLinkBox).not.toBeNull();
    expect(Math.abs((bannerBox?.x ?? 0) - (gridBox?.x ?? 0))).toBeLessThan(1);
    expect(Math.abs((bannerBox?.width ?? 0) - (gridBox?.width ?? 0))).toBeLessThan(1);
    expect(
      Math.abs((bannerBox?.width ?? 0) / (bannerBox?.height ?? 1) - 3.75),
    ).toBeLessThan(0.02);
    expect(categoryLinkBox?.width ?? Number.POSITIVE_INFINITY).toBeLessThan(130);
    await expect(section.locator('[data-category-banner]')).toHaveCSS(
      'border-radius',
      '12px',
    );
    await expect(section.locator('[data-product-card]').first()).toHaveCSS(
      'border-radius',
      '12px',
    );
    await expect(categoryLink).toHaveCSS(
      'background-color',
      'rgb(0, 154, 152)',
    );

    for (const box of cardBoxes) {
      expect(Math.abs(box.width - box.height)).toBeLessThan(1);
    }

    const media = section.locator('[data-product-media]');
    await expect(media).toHaveCount(3);
    for (const item of await media.all()) {
      const box = await item.boundingBox();
      expect(box).not.toBeNull();
      expect(Math.abs((box?.width ?? 0) - (box?.height ?? 0))).toBeLessThan(1);
    }
  });
});
