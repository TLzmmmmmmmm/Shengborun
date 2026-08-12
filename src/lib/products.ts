interface ProductSummary {
  id: string;
  categoryId: string;
  sortOrder: number;
  published: boolean;
}

export function selectPublishedProducts<T extends ProductSummary>(
  products: readonly T[],
  categoryId: string,
  limit: number,
): T[] {
  return products
    .filter(
      (product) => product.published && product.categoryId === categoryId,
    )
    .toSorted(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
    )
    .slice(0, limit);
}

interface RouteCategory {
  id: string;
  slug: string;
  sortOrder: number;
  published: boolean;
}

interface RouteProduct extends ProductSummary {
  slug: string;
}

export function buildPublishedProductRoutes<
  C extends RouteCategory,
  P extends RouteProduct,
>(categories: readonly C[], products: readonly P[]) {
  const publishedCategories = categories
    .filter((category) => category.published)
    .toSorted(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
    );
  const categoryById = new Map(
    publishedCategories.map((category) => [category.id, category]),
  );
  const details = products
    .filter((product) => product.published && categoryById.has(product.categoryId))
    .toSorted(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
    )
    .map((product) => ({
      category: categoryById.get(product.categoryId)!,
      product,
    }));

  return { categories: publishedCategories, details };
}
