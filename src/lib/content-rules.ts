import { z } from 'astro/zod';

export const PRODUCT_TAG_COLORS = [
  'teal',
  'blue',
  'green',
  'amber',
  'violet',
  'gray',
] as const;

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const seoFields = {
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
  seoPath: z.string().startsWith('/').optional(),
  seoImage: z.string().min(1).optional(),
};

export const productSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: slugSchema,
    categoryId: z.string().min(1),
    coverImage: z.string().min(1),
    galleryImages: z.array(z.string().min(1)).default([]),
    keyFeatures: z
      .array(
        z
          .object({
            label: z.string().min(1),
            color: z.enum(PRODUCT_TAG_COLORS),
          })
          .strict(),
      )
      .default([]),
    productFeatures: z.string().min(1).optional(),
    technicalParameters: z
      .array(
        z
          .object({
            group: z.string().min(1).optional(),
            items: z.array(
              z
                .object({
                  name: z.string().min(1),
                  value: z.string().min(1),
                })
                .strict(),
            ),
          })
          .strict(),
      )
      .default([]),
    sortOrder: z.number().int().default(0),
    published: z.boolean(),
    ...seoFields,
  })
  .strict();

export const productCategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: slugSchema,
    shortDescription: z.string().min(1).optional(),
    sortOrder: z.number().int().default(0),
    published: z.boolean(),
  })
  .strict();

const contentImageSchema = z
  .object({
    src: z.string().min(1),
    alt: z.string().min(1),
  })
  .strict();

export const solutionSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema,
    summary: z.string().min(1),
    coreNeeds: z.array(z.string().min(1)).default([]),
    solutionDesign: z.string().min(1),
    features: z.array(z.string().min(1)).default([]),
    bodyImages: z.array(contentImageSchema).default([]),
    systemDiagram: contentImageSchema.optional(),
    sortOrder: z.number().int().default(0),
    published: z.boolean(),
    ...seoFields,
  })
  .strict();

export const siteSettingsSchema = z
  .object({
    siteName: z.string().min(1),
    siteDescription: z.string().min(1),
  })
  .strict();

type ProductTagColor = (typeof PRODUCT_TAG_COLORS)[number];

interface ContentReferences {
  categories: Array<{ id: string; slug: string }>;
  products: Array<{
    id: string;
    categoryId: string;
    keyFeatures?: Array<{ label: string; color: ProductTagColor }>;
  }>;
}

export function validateContentReferences({
  categories,
  products,
}: ContentReferences): string[] {
  const errors: string[] = [];
  const categoryIds = new Set(categories.map((category) => category.id));

  const seenCategoryIds = new Set<string>();
  const reportedCategoryIds = new Set<string>();
  for (const category of categories) {
    if (
      seenCategoryIds.has(category.id) &&
      !reportedCategoryIds.has(category.id)
    ) {
      errors.push(`Duplicate product category id: ${category.id}`);
      reportedCategoryIds.add(category.id);
    }
    seenCategoryIds.add(category.id);
  }

  const seenProductIds = new Set<string>();
  const reportedProductIds = new Set<string>();
  for (const product of products) {
    if (
      seenProductIds.has(product.id) &&
      !reportedProductIds.has(product.id)
    ) {
      errors.push(`Duplicate product id: ${product.id}`);
      reportedProductIds.add(product.id);
    }
    seenProductIds.add(product.id);
  }

  for (const product of products) {
    if (!categoryIds.has(product.categoryId)) {
      errors.push(`Unknown categoryId: ${product.categoryId}`);
    }
  }

  const featureColors = new Map<string, ProductTagColor>();
  const reportedFeatureConflicts = new Set<string>();

  for (const product of products) {
    for (const feature of product.keyFeatures ?? []) {
      const existingColor = featureColors.get(feature.label);

      if (!existingColor) {
        featureColors.set(feature.label, feature.color);
        continue;
      }

      if (
        existingColor !== feature.color &&
        !reportedFeatureConflicts.has(feature.label)
      ) {
        errors.push(
          `Feature label "${feature.label}" uses both "${existingColor}" and "${feature.color}".`,
        );
        reportedFeatureConflicts.add(feature.label);
      }
    }
  }

  return errors;
}
