import { expect, test } from '@playwright/test';

const approvedNavigation = [
  ['首页', '/'],
  ['产品中心', '/products/'],
  ['解决方案', '/solutions/'],
  ['技术支持', '/support/'],
  ['关于我们', '/about/'],
] as const;

test('header and footer follow the approved structure', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: '主导航' });
  const navigationLinks = navigation.getByRole('link');
  await expect(navigationLinks).toHaveCount(5);

  for (const [name, href] of approvedNavigation) {
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute(
      'href',
      href,
    );
  }

  await expect(
    page
      .locator('header.site-header a')
      .filter({ has: page.locator('img[alt="盛博润"]') }),
  ).toHaveCount(0);
  await expect(page.locator('header.site-header')).not.toContainText('电话咨询');

  const footer = page.locator('footer');
  await expect(page.getByRole('navigation', { name: '页脚导航' })).toBeVisible();
  await expect(footer.locator('details')).toHaveCount(5);
  await expect(footer).not.toContainText('工作时间');
  await expect(footer).not.toContainText('电话');
  await expect(footer).not.toContainText('邮箱');
  await expect(footer).not.toContainText('地址');
  await expect(page.getByRole('link', { name: '隐私政策' })).toHaveAttribute(
    'href',
    '/privacy/',
  );
  await expect(footer.getByRole('link', { name: '使用说明' })).toHaveAttribute(
    'href',
    '/support#manuals',
  );
  await expect(footer.getByRole('link', { name: '常见问题', exact: true })).toHaveAttribute(
    'href',
    '/support#faq',
  );
  await expect(footer.getByRole('link', { name: '售后服务' })).toHaveAttribute(
    'href',
    '/support#after-sales',
  );
  await expect(footer.getByRole('link', { name: '联系我们' })).toHaveAttribute(
    'href',
    '/about#contact',
  );
});

test('provides skip navigation and complete page metadata', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: '跳至主要内容' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute('href', '#main-content');
  await expect(page.locator('main#main-content')).toHaveCount(1);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.shengborun.com/',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /盛博润/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /盛博润/,
  );
  await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
    'href',
    '/sitemap-index.xml',
  );
});

test('keeps navigation usable and avoids horizontal overflow', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    if (width === 320) {
      const menuButton = page.getByRole('button', { name: '打开主导航' });
      await expect(menuButton).toBeVisible();
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: '关闭主导航' }),
      ).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Escape');
      await expect(menuButton).toBeFocused();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await page.keyboard.press('Space');
      await expect(
        page.getByRole('button', { name: '关闭主导航' }),
      ).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');

      const firstFooterGroup = page.locator('footer details').first();
      const firstFooterSummary = firstFooterGroup.locator('summary');
      await expect(firstFooterGroup).not.toHaveAttribute('open', '');
      await firstFooterSummary.focus();
      await page.keyboard.press('Enter');
      await expect(firstFooterGroup).toHaveAttribute('open', '');
    }

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }
});
