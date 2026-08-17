export const PRODUCT_FEATURE_ICONS = [
  'antenna',
  'backpack',
  'badge-check',
  'battery',
  'bell',
  'blocks',
  'feather',
  'globe',
  'hand',
  'headphones',
  'layers',
  'monitor',
  'radio',
  'radio-tower',
  'scan-line',
  'shield-check',
  'signal',
  'sliders',
  'volume',
  'zap',
] as const;

export type ProductFeatureIcon = (typeof PRODUCT_FEATURE_ICONS)[number];

export interface ProductFeatureDefinition {
  name: string;
  icon: ProductFeatureIcon;
}

export type ResolvedProductFeature = ProductFeatureDefinition;

export function resolveProductFeatures(
  names: readonly string[],
  library: readonly ProductFeatureDefinition[],
  limit = 4,
): ResolvedProductFeature[] {
  const byName = new Map(library.map((feature) => [feature.name, feature]));

  return names.slice(0, limit).map((name) => {
    const feature = byName.get(name);
    if (!feature) throw new Error(`Unknown product feature: ${name}`);
    return feature;
  });
}
