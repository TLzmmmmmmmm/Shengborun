import { describe, expect, it } from 'vitest';
import { resolveFooterBreadcrumbs } from '../../src/lib/breadcrumbs';

describe('resolveFooterBreadcrumbs', () => {
  it('uses 首页 as the homepage breadcrumb', () => {
    expect(resolveFooterBreadcrumbs()).toEqual([{ label: '首页' }]);
  });

  it('prepends a linked 首页 item for inner pages', () => {
    expect(resolveFooterBreadcrumbs([{ label: '产品中心' }])).toEqual([
      { label: '首页', href: '/' },
      { label: '产品中心' },
    ]);
  });

  it('does not duplicate an existing 首页 item', () => {
    const items = [
      { label: '首页', href: '/' },
      { label: '产品中心' },
    ] as const;

    expect(resolveFooterBreadcrumbs(items)).toEqual(items);
  });
});
