export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const HOME: BreadcrumbItem = { label: '首页', href: '/' };

export const resolveFooterBreadcrumbs = (
  items: readonly BreadcrumbItem[] = [],
): BreadcrumbItem[] => {
  if (items.length === 0) return [{ label: '首页' }];
  if (items[0]?.label === '首页') return [...items];
  return [HOME, ...items];
};
