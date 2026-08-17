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

type ProductsPagePlaceholder = Pick<
  ProductsPageCategory,
  'id' | 'banner' | 'bannerAlt' | 'products'
>;

export const placeholderProductCategories: ProductsPagePlaceholder[] = [
  {
    id: 'shortwave-radio',
    banner: '/images/products/shortwave-radio-banner.png',
    bannerAlt: '远距离短波通信设备与山地通信场景',
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
    banner: '/images/products/mesh-network-banner.png',
    bannerAlt: '应急现场中的无线自组网通信设备',
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
    banner: '/images/products/ict-integration-banner.png',
    bannerAlt: '数据中心内的信息与通信基础设施',
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
