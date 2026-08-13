import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('homepage and products overview boundaries', () => {
  it('uses the approved category descriptions as canonical content', async () => {
    const files = [
      'two-way-radio.json',
      'shortwave-radio.json',
      'mesh-network.json',
      'ict-integration.json',
    ];
    const descriptions = await Promise.all(
      files.map(async (file) => {
        const source = await readFile(
          path.resolve('src/content/product-categories', file),
          'utf8',
        );
        return JSON.parse(source).shortDescription;
      }),
    );

    expect(descriptions).toEqual([
      '专业可靠的即时通信设备，满足多场景协同需求。',
      '面向远距离与复杂环境的稳定通信系统。',
      '快速部署、多节点协同的无线组网设备。',
      '融合网络、计算、安全与通信的一体化基础设施。',
    ]);
  });

  it('keeps both pages independent instead of importing either page wholesale', async () => {
    const homepage = await readFile(
      path.resolve('src/pages/index.astro'),
      'utf8',
    );
    const productsPage = await readFile(
      path.resolve('src/pages/products/index.astro'),
      'utf8',
    );

    expect(homepage).not.toContain('pages/products/index.astro');
    expect(productsPage).not.toContain('pages/index.astro');
    expect(homepage).toContain('getProductPresentation');
    expect(productsPage).not.toContain('getProductPresentation');
    expect(productsPage).toContain('productCategoryOverview');
  });
});
