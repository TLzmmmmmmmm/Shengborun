import { expect, test } from '@playwright/test';

const categories = [
  {
    id: 'two-way-radio',
    name: '对讲机通信',
    description: '专业可靠的即时通信设备，满足多场景协同需求。',
    href: '/two-way-radio/',
  },
  {
    id: 'shortwave-radio',
    name: '短波通信',
    description: '面向远距离与复杂环境的稳定通信系统。',
    href: '/shortwave-radio/',
  },
  {
    id: 'mesh-network',
    name: '自组网通信',
    description: '快速部署、多节点协同的无线组网设备。',
    href: '/mesh-network/',
  },
  {
    id: 'ict-integration',
    name: 'ICT 集成',
    description: '融合网络、计算、安全与通信的一体化基础设施。',
    href: '/ict-integration/',
  },
] as const;

test.describe('products overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/');
  });

  test('renders the approved overview content and ordered full-card links', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: '产品中心', level: 1 }),
    ).toBeVisible();
    await expect(page.locator('[data-products-intro]')).toContainText(
      '专业的通信设备与解决方案，助力客户高效连接世界',
    );

    const cards = page.locator('[data-category-overview-card]');
    await expect(cards).toHaveCount(4);
    expect(
      await cards.evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-category-overview-card')),
      ),
    ).toEqual(categories.map(({ id }) => id));

    for (const [index, category] of categories.entries()) {
      const card = cards.nth(index);
      await expect(card).toHaveAttribute('href', category.href);
      await expect(
        card.getByRole('heading', { name: category.name, level: 2 }),
      ).toBeVisible();
      await expect(card).toContainText(category.description);
      await expect(card).toContainText('查看产品');
      await expect(card.getByRole('img')).toHaveAttribute(
        'src',
        `/images/products/category-cards/${category.id}.png`,
      );
    }

    await expect(page.locator('[data-category-section]')).toHaveCount(0);
  });

  test('uses two columns on desktop and lets the second row peek at 1366 × 768', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.reload();

    const cards = page.locator('[data-category-overview-card]');
    const boxes = await cards.evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
    );

    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[2].y).toBe(boxes[3].y);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[2].y).toBeLessThan(768);
    expect(boxes[0].height).toBeGreaterThan(360);

    if (process.env.CAPTURE_PRODUCTS === '1') {
      await page.screenshot({
        path: 'docs/design-previews/products-overview/products-1366x768.png',
        fullPage: false,
      });
    }
  });

  test('matches the homepage content width and centers its introduction', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    const overviewWidth = await page.locator('.products-content').evaluate(
      (element) => element.getBoundingClientRect().width,
    );

    await page.goto('/');
    const homepageWidth = await page.locator('.products-content').evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(overviewWidth).toBe(homepageWidth);

    await page.goto('/products/');
    await expect(page.locator('[data-products-intro]')).toHaveCSS('text-align', 'center');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('[data-products-intro]')).toHaveCSS('text-align', 'center');
  });

  test('uses one column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const boxes = await page
      .locator('[data-category-overview-card]')
      .evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect();
          return { x: box.x, y: box.y };
        }),
      );

    expect(boxes[0].x).toBe(boxes[1].x);
    expect(boxes[0].y).toBeLessThan(boxes[1].y);
    expect(boxes[1].y).toBeLessThan(boxes[2].y);

    if (process.env.CAPTURE_PRODUCTS === '1') {
      await page.screenshot({
        path: 'docs/design-previews/products-overview/products-390x844.png',
        fullPage: false,
      });
    }
  });
});

test('homepage keeps its existing reusable product presentation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-category-section]')).toHaveCount(4);
  await expect(page.locator('[data-category-overview-card]')).toHaveCount(0);
});
