export interface HomepageImageCard {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}

export interface HomepageIconItem {
  name: string;
  description: string;
  icon: string;
  href?: string;
}

export interface HomepagePartner {
  name: string;
  image: string;
  imageAlt: string;
  imageClass: string;
}

export const heroBenefits: readonly HomepageIconItem[] = [
  { name: '多场景覆盖', description: '适配多行业通信需求', icon: 'layers' },
  { name: '稳定可靠', description: '关键时刻持续在线', icon: 'shield' },
  { name: '自主可控', description: '专业团队全程保障', icon: 'building' },
  { name: '智能互联', description: '融合通信高效协同', icon: 'network' },
];

export const productCategories: readonly HomepageImageCard[] = [
  {
    name: '对讲机通信',
    description: '专业可靠的即时通信设备，满足多场景协同需求。',
    image: '/images/home/products/two-way-radio.png',
    imageAlt: '工业场景中的专业手持对讲机',
    href: '/two-way-radio/',
  },
  {
    name: '短波通信',
    description: '面向远距离与复杂环境的稳定通信系统。',
    image: '/images/home/products/shortwave.png',
    imageAlt: '用于远距离通信的短波电台与天线设备',
    href: '/shortwave-radio/',
  },
  {
    name: '自组网通信',
    description: '快速部署、多节点协同的无线组网设备。',
    image: '/images/home/products/mesh-network.png',
    imageAlt: '无人机与地面节点组成的无线自组网',
    href: '/mesh-network/',
  },
  {
    name: 'ICT 集成',
    description: '融合网络、计算、安全与通信的一体化基础设施。',
    image: '/images/home/products/ict-integration.png',
    imageAlt: '数据中心内的 ICT 服务器与网络基础设施',
    href: '/ict-integration/',
  },
];

export const solutions: readonly HomepageImageCard[] = [
  {
    name: '酒店行业',
    description: '统一酒店通信调度，提升跨部门服务效率与响应速度。',
    image: '/images/home/solutions/hotel.png',
    imageAlt: '酒店大堂与公共服务区域',
    href: '/solutions/hotel/',
  },
  {
    name: '企事业单位',
    description: '实现跨部门互联互通、通话分组与统一通信调度。',
    image: '/images/home/solutions/enterprise.png',
    imageAlt: '企事业单位园区与专业通信设备',
    href: '/solutions/enterprise/',
  },
  {
    name: '石油石化',
    description: '满足厂区防爆、广域覆盖与安全生产通信需求。',
    image: '/images/home/solutions/petrochemical.png',
    imageAlt: '石油石化厂区内使用对讲机的工作人员',
    href: '/solutions/petrochemical/',
  },
  {
    name: '人防行业',
    description: '快速建立现场宽带网络，保障应急指挥与信息回传。',
    image: '/images/home/solutions/civil-defense.png',
    imageAlt: '人防应急现场部署的宽带通信设备',
    href: '/solutions/civil-defense/',
  },
];

export const supportItems: readonly HomepageIconItem[] = [
  {
    name: '方案设计',
    description: '深入需求分析，定制专业、高效的通信解决方案。',
    icon: 'file-pen',
    href: '/support/#solution-design',
  },
  {
    name: '交付培训',
    description: '完成项目交付与使用维护培训，帮助团队快速掌握系统。',
    icon: 'graduation-cap',
    href: '/support/#delivery-training',
  },
  {
    name: '项目施工',
    description: '专业施工与系统调试，保障项目稳定运行与顺利交付。',
    icon: 'wrench',
    href: '/support/#project-implementation',
  },
];

export const reasons: readonly HomepageIconItem[] = [
  {
    name: '即时响应',
    description: '及时响应业务需求，快速提供专业支持。',
    icon: 'headphones',
  },
  {
    name: '安全可靠',
    description: '全面的安全防护与严格测试，保障通信稳定。',
    icon: 'shield-check',
  },
  {
    name: '专业水准',
    description: '专注行业通信解决方案，具备系统集成能力。',
    icon: 'user-round',
  },
  {
    name: '全周期无忧',
    description: '覆盖咨询、设计、施工、培训与售后的完整服务。',
    icon: 'heart-handshake',
  },
];

export const partners: readonly HomepagePartner[] = [
  {
    name: '摩托罗拉系统',
    image: '/images/home/partners/motorola.png',
    imageAlt: 'Motorola Solutions 标志',
    imageClass: 'partner-motorola',
  },
  {
    name: '海能达',
    image: '/images/home/partners/hytera.png',
    imageAlt: 'Hytera 海能达标志',
    imageClass: 'partner-hytera',
  },
  {
    name: '华为',
    image: '/images/home/partners/huawei.png',
    imageAlt: 'Huawei 华为标志',
    imageClass: 'partner-huawei',
  },
  {
    name: '新华三集团',
    image: '/images/home/partners/h3c.png',
    imageAlt: 'H3C 新华三集团标志',
    imageClass: 'partner-h3c',
  },
  {
    name: '柯顿通信',
    image: '/images/home/partners/codan.png',
    imageAlt: 'Codan Radio Communications 标志',
    imageClass: 'partner-codan',
  },
];
