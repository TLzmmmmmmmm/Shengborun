import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

import {
  documentSchema,
  faqSchema,
  productCategorySchema,
  productSchema,
  siteSettingsSchema,
  solutionSchema,
} from './lib/content-rules';

const productCategories = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/product-categories',
  }),
  schema: productCategorySchema,
});

const products = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/products',
  }),
  schema: productSchema,
});

const solutions = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/solutions',
  }),
  schema: solutionSchema,
});

const documents = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/documents',
  }),
  schema: documentSchema,
});

const faq = defineCollection({
  loader: file('./src/content/faq/questions.json'),
  schema: faqSchema,
});

const site = defineCollection({
  loader: file('./src/content/site/settings.json'),
  schema: siteSettingsSchema,
});

export const collections = {
  productCategories,
  products,
  solutions,
  documents,
  faq,
  site,
};
