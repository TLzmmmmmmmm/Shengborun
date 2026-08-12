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
