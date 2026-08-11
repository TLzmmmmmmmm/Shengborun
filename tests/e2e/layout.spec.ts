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
  const faqLinks = footer.getByRole('link', { name: '常见问题', exact: true });
  await expect(faqLinks).toHaveCount(1);
  await expect(faqLinks).toHaveAttribute('href', '/support/faq/');
  await expect(footer).not.toContainText('全部常见问题');
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

test('keeps the brand mark compact and aligned with desktop navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const logoBox = await page.locator('.brand-mark img').boundingBox();
  const homeLinkBox = await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '首页', exact: true })
    .boundingBox();

  expect(logoBox).not.toBeNull();
  expect(homeLinkBox).not.toBeNull();
  expect(logoBox!.width).toBeGreaterThanOrEqual(143);
  expect(logoBox!.width).toBeLessThanOrEqual(145);

  const logoCenter = logoBox!.y + logoBox!.height / 2;
  const navigationCenter = homeLinkBox!.y + homeLinkBox!.height / 2;
  expect(Math.abs(logoCenter - navigationCenter)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 320, height: 900 });
  const mobileLogoBox = await page.locator('.brand-mark img').boundingBox();
  expect(mobileLogoBox).not.toBeNull();
  expect(mobileLogoBox!.width).toBeGreaterThanOrEqual(119);
  expect(mobileLogoBox!.width).toBeLessThanOrEqual(121);
});

test('keeps the compact header pinned while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/');

  const header = page.locator('[data-site-header]');
  await expect(header).toHaveCSS('position', 'sticky');
  await expect(header).toHaveCSS('top', '0px');
  expect(Math.round((await header.boundingBox())!.height)).toBe(54);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => Math.round((await header.boundingBox())!.y)).toBe(0);

  await page.setViewportSize({ width: 320, height: 700 });
  expect(Math.round((await header.boundingBox())!.height)).toBe(48);
});

test('uses symmetric capped page gutters', async ({ page }) => {
  for (const width of [1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    for (const selector of ['.header-inner', '.footer-inner']) {
      const container = page.locator(selector);
      const box = (await container.boundingBox())!;
      const { left, right } = await container.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          left: Number.parseFloat(styles.paddingLeft),
          right: Number.parseFloat(styles.paddingRight),
        };
      });

      expect(Math.round(box.width)).toBe(width);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
      expect(left).toBeLessThanOrEqual(145);
      expect(right).toBeLessThanOrEqual(145);

      if (width === 2560) {
        expect(left).toBeGreaterThanOrEqual(143);
        expect(right).toBeGreaterThanOrEqual(143);
      }
    }
  }
});

test('renders the approved light footer hierarchy', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('.site-footer');
  const breadcrumb = footer.getByRole('navigation', { name: '面包屑' });
  const footerLinks = page.getByRole('navigation', { name: '页脚导航' });

  await expect(breadcrumb).toContainText('首页');
  await expect(footer).toHaveCSS('background-color', 'rgb(245, 245, 247)');
  await expect(footer.locator('.footer-breadcrumb')).toHaveCSS(
    'border-bottom-color',
    'rgb(218, 218, 224)',
  );
  await expect(footer.locator('summary').first()).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await expect(footer.locator('.footer-breadcrumb .breadcrumbs')).toHaveCSS(
    'font-size',
    '16px',
  );
  await expect(footer.locator('summary').first()).toHaveCSS('font-size', '16px');
  await expect(footerLinks.getByRole('link').first()).toHaveCSS(
    'color',
    'rgb(110, 110, 115)',
  );
  await expect(footerLinks.getByRole('link').first()).toHaveCSS('font-size', '16px');
  await expect(breadcrumb).toHaveCSS('color', 'rgb(110, 110, 115)');

  const legal = footer.locator('.footer-legal');
  await expect(legal).toHaveCSS('border-top-color', 'rgb(218, 218, 224)');
  await expect(legal).toHaveCSS('font-size', '14px');
  await expect(legal).toHaveCSS('justify-content', 'flex-start');
  await expect(legal).toHaveCSS('text-align', 'left');
  await expect(legal.locator(':scope > *')).toHaveCount(3);
  await expect(legal.locator(':scope > *').nth(0)).toHaveText(
    '版权所有 © 2026 北京盛博润通信设备有限公司',
  );
  await expect(legal.locator(':scope > *').nth(1)).toHaveText('ICP备案（待确认）');
  await expect(legal.locator(':scope > *').nth(2)).toHaveText(
    '公安联网备案（待确认）',
  );
  await expect(legal.getByRole('link')).toHaveCount(0);
  await expect(footer.locator('input[type="search"]')).toHaveCount(0);
});

test('uses compact mobile footer detail hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 647, height: 900 });
  await page.goto('/');

  const groups = page.locator('footer details');
  const firstGroup = groups.first();
  const firstSummary = firstGroup.locator('summary');
  const firstList = firstGroup.locator('ul');
  const firstLink = firstList.getByRole('link').first();

  await expect(firstGroup).not.toHaveAttribute('open', '');
  await firstSummary.click();
  await expect(firstGroup).toHaveAttribute('open', '');

  await expect(firstSummary).toHaveCSS('font-size', '16px');
  await expect(firstSummary).toHaveCSS('padding-top', '16px');
  await expect(firstSummary).toHaveCSS('padding-bottom', '16px');
  await expect(firstList).toHaveCSS('row-gap', '9.36px');
  await expect(firstList).toHaveCSS('padding-bottom', '17.6px');
  await expect(firstLink).toHaveCSS('font-size', '14px');
  await expect(firstLink).toHaveCSS('min-height', '36px');

  await firstSummary.focus();
  await page.keyboard.press('Enter');
  await expect(firstGroup).not.toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(firstGroup).toHaveAttribute('open', '');

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(firstGroup).toHaveAttribute('open', '');
  await expect(firstList).toHaveCSS('row-gap', '10.4px');
  await expect(firstLink).toHaveCSS('font-size', '16px');
});

test('uses a centered two-row mobile legal layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');

  const legal = page.locator('.footer-legal');
  const parts = legal.locator(':scope > *');

  await expect(legal).toHaveCSS('display', 'grid');
  await expect(legal).toHaveCSS('justify-content', 'center');
  await expect(legal).toHaveCSS('text-align', 'center');
  await expect(legal).toHaveCSS('font-size', '12px');
  await expect(legal).toHaveCSS('column-gap', '20px');

  const legalBox = (await legal.boundingBox())!;
  const copyright = (await parts.nth(0).boundingBox())!;
  const icp = (await parts.nth(1).boundingBox())!;
  const police = (await parts.nth(2).boundingBox())!;
  const centerX = (box: { x: number; width: number }) => box.x + box.width / 2;
  const centerY = (box: { y: number; height: number }) => box.y + box.height / 2;

  expect(copyright.y + copyright.height).toBeLessThanOrEqual(icp.y);
  expect(Math.abs(centerX(copyright) - centerX(legalBox))).toBeLessThanOrEqual(1);
  expect(Math.abs(centerY(icp) - centerY(police))).toBeLessThanOrEqual(1);
  expect(icp.x + icp.width).toBeLessThan(police.x);

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(legal).toHaveCSS('display', 'flex');
  await expect(legal).toHaveCSS('justify-content', 'flex-start');
  await expect(legal).toHaveCSS('text-align', 'left');
  await expect(legal).toHaveCSS('font-size', '14px');
});

test('uses the final navigation border and desktop legal separator', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');

  const footerGroups = page.locator('footer details');
  const lastFooterGroup = footerGroups.last();
  const legal = page.locator('.footer-legal');

  await expect(lastFooterGroup).toHaveCSS('border-bottom-width', '1px');
  await expect(lastFooterGroup).toHaveCSS(
    'border-bottom-color',
    'rgb(218, 218, 224)',
  );
  await expect(legal).toHaveCSS('border-top-width', '0px');

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(legal).toHaveCSS('border-top-width', '1px');
  await expect(legal).toHaveCSS('border-top-color', 'rgb(218, 218, 224)');
});

test('uses one compact border line for mobile navigation states', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开主导航' }).click();

  const navigation = page.getByRole('navigation', { name: '主导航' });
  const home = navigation.getByRole('link', { name: '首页', exact: true });
  const products = navigation.getByRole('link', {
    name: '产品中心',
    exact: true,
  });
  const about = navigation.getByRole('link', { name: '关于我们', exact: true });

  await expect(home).toHaveCSS('min-height', '43.2px');
  await expect(home).toHaveCSS('border-bottom-width', '1px');
  await expect(home).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
  await expect(products).toHaveCSS('border-bottom-color', 'rgb(232, 232, 237)');
  expect(
    await home.evaluate((element) => getComputedStyle(element, '::after').display),
  ).toBe('none');

  const productsBeforeHover = (await products.boundingBox())!;
  await products.hover();
  await expect(products).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
  const productsAfterHover = (await products.boundingBox())!;
  expect(productsAfterHover.height).toBeCloseTo(productsBeforeHover.height, 5);

  await expect(about).toHaveCSS('border-bottom-width', '1px');
  await expect(about).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0)');
  await about.hover();
  await expect(about).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');

  await page.mouse.move(0, 0);
  await home.evaluate((element) => element.removeAttribute('aria-current'));
  await about.evaluate((element) => element.setAttribute('aria-current', 'page'));
  await expect(about).toHaveCSS('border-bottom-color', 'rgb(0, 183, 181)');
});

test('keeps navigation usable and avoids horizontal overflow', async ({ page }) => {
  for (const width of [320, 768, 1440, 1920, 2560]) {
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
      await expect(firstFooterGroup).toHaveCSS(
        'border-bottom-color',
        'rgb(218, 218, 224)',
      );
      await expect(firstFooterGroup).toHaveCSS('border-bottom-width', '1px');

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
