import { describe, expect, it } from 'vitest';

import { SITE_ORIGIN } from '../../src/config/site';

describe('site configuration', () => {
  it('uses the public HTTPS production origin', () => {
    expect(SITE_ORIGIN).toBe('https://www.shengborun.com');
  });
});
