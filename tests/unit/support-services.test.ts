import { describe, expect, it } from 'vitest';

import { supportServices } from '../../src/data/support-services';

describe('support service routes', () => {
  it('keeps the six approved names and paths in footer order', () => {
    expect(supportServices.map(({ name, href }) => [name, href])).toEqual([
      ['网络规划服务', '/support/network-planning/'],
      ['系统工程建设服务', '/support/system-engineering/'],
      ['维护保障服务', '/support/maintenance-support/'],
      ['设备巡检服务', '/support/equipment-inspection/'],
      ['通讯保障服务', '/support/communication-support/'],
      ['技术培训服务', '/support/technical-training/'],
    ]);
  });
});
