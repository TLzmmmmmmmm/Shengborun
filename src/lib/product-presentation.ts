import { getCollection } from 'astro:content';

import {
  placeholderProductCategories,
  type ProductsPageCategory,
} from '../data/products-page-placeholders';
import { selectPublishedProducts } from './products';

const presentationAssets = new Map(
  placeholderProductCategories.map((category) => [category.id, category]),
);

export async function getProductPresentation(): Promise<ProductsPageCategory[]> {
  const [categoryEntries, productEntries] = await Promise.all([
    getCollection('productCategories', ({ data }) => data.published),
    getCollection('products', ({ data }) => data.published),
  ]);

  return categoryEntries
    .toSorted((left, right) => left.data.sortOrder - right.data.sortOrder)
    .map(({ data: category }) => {
      const fallback = presentationAssets.get(category.id);
      const realProducts = selectPublishedProducts(
        productEntries.map((entry) => entry.data),
        category.id,
        3,
      ).map((product) => ({
        name: product.name,
        image: product.coverImage,
        imageAlt:
          product.id === 'ly198'
            ? '润信达 LY198 模拟对讲机正面图'
            : `${product.name}产品图`,
        href: `/${category.slug}/${product.slug}/`,
      }));

      if (!fallback && realProducts.length === 0) {
        throw new Error(`Missing presentation assets for ${category.id}.`);
      }

      return {
        id: category.id,
        name: category.name,
        description: category.shortDescription ?? fallback?.description ?? '',
        banner:
          fallback?.banner ?? `/images/products/${category.slug}-banner.png`,
        bannerAlt: fallback?.bannerAlt ?? `${category.name}产品场景`,
        href: `/${category.slug}/`,
        products: realProducts.length > 0 ? realProducts : fallback!.products,
      };
    });
}
