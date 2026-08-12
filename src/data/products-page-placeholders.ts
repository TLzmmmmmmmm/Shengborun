export interface ProductsPageItem {
  name: string;
  image: string;
  imageAlt: string;
  href: string;
}

export interface ProductsPageCategory {
  id: string;
  name: string;
  description: string;
  banner: string;
  bannerAlt: string;
  href: string;
  products: ProductsPageItem[];
}

export const placeholderProductCategories: ProductsPageCategory[] = [
  {
    id: 'shortwave-radio',
    name: '短波通信',
    description: '面向远距离与复杂环境的短波通信设备',
    banner: '/images/products/shortwave-radio-banner.png',
    bannerAlt: '远距离短波通信设备与山地通信场景',
    href: '/shortwave-radio/',
    products: [
      {
        name: '短波产品 01',
        image: '/images/products/shortwave-product-01.png',
        imageAlt: '短波产品 01 示意图',
        href: '/shortwave-radio/',
      },
      {
        name: '短波产品 02',
        image: '/images/products/shortwave-product-02.png',
        imageAlt: '短波产品 02 示意图',
        href: '/shortwave-radio/',
      },
      {
        name: '短波产品 03',
        image: '/images/products/shortwave-product-03.png',
        imageAlt: '短波产品 03 示意图',
        href: '/shortwave-radio/',
      },
    ],
  },
  {
    id: 'mesh-network',
    name: '自组网通信',
    description: '快速部署、灵活组网的无线通信产品',
    banner: '/images/products/mesh-network-banner.png',
    bannerAlt: '应急现场中的无线自组网通信设备',
    href: '/mesh-network/',
    products: [
      {
        name: '自组网产品 01',
        image: '/images/products/mesh-product-01.png',
        imageAlt: '自组网产品 01 示意图',
        href: '/mesh-network/',
      },
      {
        name: '自组网产品 02',
        image: '/images/products/mesh-product-02.png',
        imageAlt: '自组网产品 02 示意图',
        href: '/mesh-network/',
      },
      {
        name: '自组网产品 03',
        image: '/images/products/mesh-product-03.png',
        imageAlt: '自组网产品 03 示意图',
        href: '/mesh-network/',
      },
    ],
  },
  {
    id: 'ict-integration',
    name: 'ICT 集成',
    description: '面向行业客户的一体化信息与通信能力',
    banner: '/images/products/ict-integration-banner.png',
    bannerAlt: '数据中心内的信息与通信基础设施',
    href: '/ict-integration/',
    products: [
      {
        name: 'ICT 产品 01',
        image: '/images/products/ict-product-01.png',
        imageAlt: 'ICT 产品 01 示意图',
        href: '/ict-integration/',
      },
      {
        name: 'ICT 产品 02',
        image: '/images/products/ict-product-02.png',
        imageAlt: 'ICT 产品 02 示意图',
        href: '/ict-integration/',
      },
      {
        name: 'ICT 产品 03',
        image: '/images/products/ict-product-03.png',
        imageAlt: 'ICT 产品 03 示意图',
        href: '/ict-integration/',
      },
    ],
  },
];
