export type CategoryVisualIcon = 'radio' | 'radio-tower' | 'network' | 'server';

export interface CategoryVisual {
  icon: CategoryVisualIcon;
  banner: string;
  bannerAlt: string;
  objectPosition: string;
}

export const categoryVisuals: Record<string, CategoryVisual> = {
  'two-way-radio': {
    icon: 'radio',
    banner: '/images/products/two-way-radio-banner.png',
    bannerAlt: '工业通信现场中的专业对讲机设备',
    objectPosition: 'center center',
  },
  'shortwave-radio': {
    icon: 'radio-tower',
    banner: '/images/products/shortwave-radio-banner.png',
    bannerAlt: '山地环境中的远距离短波通信设备',
    objectPosition: 'center center',
  },
  'mesh-network': {
    icon: 'network',
    banner: '/images/products/mesh-network-banner.png',
    bannerAlt: '工业现场中的多节点无线自组网系统',
    objectPosition: 'center center',
  },
  'ict-integration': {
    icon: 'server',
    banner: '/images/products/ict-integration-banner.png',
    bannerAlt: '专业 ICT 基础设施与集成设备系统',
    objectPosition: 'center center',
  },
};
