import { describe, expect, it } from 'vitest';

import {
  selectAllPublishedProducts,
  selectPublishedProducts,
} from '../../src/lib/products';

describe('product queries', () => {
  it('returns the first published products in sort order for one category', () => {
    const products = [
      { id: 'hidden', categoryId: 'two-way-radio', sortOrder: 0, published: false },
      { id: 'fourth', categoryId: 'two-way-radio', sortOrder: 4, published: true },
      { id: 'second', categoryId: 'two-way-radio', sortOrder: 2, published: true },
      { id: 'other', categoryId: 'shortwave-radio', sortOrder: 1, published: true },
      { id: 'first', categoryId: 'two-way-radio', sortOrder: 1, published: true },
      { id: 'third', categoryId: 'two-way-radio', sortOrder: 3, published: true },
    ];

    expect(selectPublishedProducts(products, 'two-way-radio', 3).map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('returns every published product for one category with deterministic ties', () => {
    const products = [
      { id: 'zeta', categoryId: 'two-way-radio', sortOrder: 2, published: true },
      { id: 'hidden', categoryId: 'two-way-radio', sortOrder: 0, published: false },
      { id: 'beta', categoryId: 'two-way-radio', sortOrder: 1, published: true },
      { id: 'other', categoryId: 'shortwave-radio', sortOrder: 0, published: true },
      { id: 'alpha', categoryId: 'two-way-radio', sortOrder: 1, published: true },
      { id: 'gamma', categoryId: 'two-way-radio', sortOrder: 3, published: true },
    ];

    expect(
      selectAllPublishedProducts(products, 'two-way-radio').map(({ id }) => id),
    ).toEqual(['alpha', 'beta', 'zeta', 'gamma']);
  });
});
