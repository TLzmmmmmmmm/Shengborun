import { getCollection } from 'astro:content';

export interface ProductCategoryOverviewItem {
  id: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}

const overviewVisuals = [
  {
    id: 'two-way-radio',
    image: '/images/products/category-cards/two-way-radio.png',
    imageAlt: '专业对讲机通信设备',
  },
  {
    id: 'shortwave-radio',
    image: '/images/products/category-cards/shortwave-radio.png',
    imageAlt: '远距离短波通信设备与应用场景',
  },
  {
    id: 'mesh-network',
    image: '/images/products/category-cards/mesh-network.png',
    imageAlt: '多节点无线自组网通信设备',
  },
  {
    id: 'ict-integration',
    image: '/images/products/category-cards/ict-integration.png',
    imageAlt: '由多种网络与计算设备组成的 ICT 集成系统',
  },
] as const;

const visualById = new Map(overviewVisuals.map((item) => [item.id, item]));

export async function getProductCategoryOverview(): Promise<
  ProductCategoryOverviewItem[]
> {
  const categories = await getCollection(
    'productCategories',
    ({ data }) => data.published,
  );

  return categories
    .toSorted((left, right) => left.data.sortOrder - right.data.sortOrder)
    .map(({ data }) => {
      const visual = visualById.get(data.id as (typeof overviewVisuals)[number]['id']);
      if (!visual) throw new Error(`Missing overview visual for ${data.id}.`);

      return {
        id: data.id,
        name: data.name,
        description: data.shortDescription ?? '',
        image: visual.image,
        imageAlt: visual.imageAlt,
        href: `/${data.slug}/`,
      };
    });
}
