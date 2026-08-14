import { describe, expect, it } from 'vitest';
import { prepareTechnicalParameters } from '../../src/lib/technical-parameters';

describe('technical parameter presentation', () => {
  it('preserves desktop groups and flattens mobile items in source order', () => {
    const result = prepareTechnicalParameters([
      { group: '一般规格', items: [{ name: '频率', value: '400 MHz' }] },
      { group: '环境参数', items: [{ name: '温度', value: '-20℃～55℃' }] },
    ]);

    expect(result.groups.map(({ label }) => label)).toEqual(['一般规格', '环境参数']);
    expect(result.allItems.map(({ name }) => name)).toEqual(['频率', '温度']);
    expect(result.isEmpty).toBe(false);
  });

  it('reports empty data and supplies a stable fallback group label', () => {
    expect(prepareTechnicalParameters([])).toEqual({
      groups: [],
      allItems: [],
      isEmpty: true,
    });
    expect(prepareTechnicalParameters([{ items: [{ name: '功率', value: '2 W' }] }]).groups[0])
      .toMatchObject({ id: 'parameter-group-0', label: '技术参数' });
  });
});
