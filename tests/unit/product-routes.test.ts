import { describe, expect, it } from 'vitest';

import { buildPublishedProductRoutes } from '../../src/lib/products';

describe('published product routes', () => {
  it('builds sorted category routes and only matching published product routes', () => {
    const result = buildPublishedProductRoutes(
      [
        { id: 'shortwave-radio', slug: 'shortwave-radio', sortOrder: 2, published: true },
        { id: 'two-way-radio', slug: 'two-way-radio', sortOrder: 1, published: true },
        { id: 'hidden', slug: 'hidden', sortOrder: 3, published: false },
      ],
      [
        { id: 'ly198', slug: 'ly198', categoryId: 'two-way-radio', sortOrder: 1, published: true },
        { id: 'hidden-product', slug: 'hidden-product', categoryId: 'two-way-radio', sortOrder: 2, published: false },
        { id: 'orphan', slug: 'orphan', categoryId: 'missing', sortOrder: 3, published: true },
      ],
    );

    expect(result.categories.map((item) => item.slug)).toEqual([
      'two-way-radio',
      'shortwave-radio',
    ]);
    expect(result.details.map((item) => ({
      categorySlug: item.category.slug,
      productSlug: item.product.slug,
    }))).toEqual([{ categorySlug: 'two-way-radio', productSlug: 'ly198' }]);
  });
});
