import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('homepage and temporary products page boundaries', () => {
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
    expect(productsPage).toContain('getProductPresentation');
  });
});
