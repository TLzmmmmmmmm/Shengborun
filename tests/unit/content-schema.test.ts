import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

import featureLibrary from '../../src/content/product-features/features.json';
import {
  productCategorySchema,
  productFeatureLibrarySchema,
  productSchema,
  siteSettingsSchema,
  solutionSchema,
  validateContentReferences,
} from '../../src/lib/content-rules';
import { resolveProductFeatures } from '../../src/lib/product-features';

describe('content rules', () => {
  it('accepts the canonical name and icon feature library', () => {
    const result = productFeatureLibrarySchema.safeParse([
      { name: '一键对频', icon: 'scan-line' },
      { name: '电量提示', icon: 'battery' },
    ]);

    expect(result.success).toBe(true);
    expect(
      productFeatureLibrarySchema.safeParse([
        { name: '一键对频', color: 'teal' },
      ]).success,
    ).toBe(false);
  });

  it('resolves at most four product features in source order', () => {
    const resolved = resolveProductFeatures(
      ['一键对频', '一体天线', '小巧轻薄', '电量提示', '智能降噪'],
      featureLibrary,
    );

    expect(resolved.map(({ name }) => name)).toEqual([
      '一键对频',
      '一体天线',
      '小巧轻薄',
      '电量提示',
    ]);
  });

  it('accepts the approved product fields and string key features', () => {
    const result = productSchema.safeParse({
      id: 'radio-sample',
      name: '示例数字对讲机',
      slug: 'sample-radio',
      categoryId: 'two-way-radio',
      coverImage: '/images/products/sample-radio.svg',
      keyFeatures: ['数字通信', '超长续航'],
      published: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects product shortDescription while preserving category summaries', () => {
    const productResult = productSchema.safeParse({
      id: 'radio-sample',
      name: '示例数字对讲机',
      slug: 'sample-radio',
      categoryId: 'two-way-radio',
      shortDescription:
        '适用于日常调度与现场协作的示例数字对讲机，支持稳定清晰的语音通信。',
      coverImage: '/images/products/sample-radio.svg',
      published: true,
    });
    const categoryResult = productCategorySchema.safeParse({
      id: 'two-way-radio',
      name: '对讲机通信',
      slug: 'two-way-radio',
      shortDescription: '产品类别可以继续保留简介。',
      published: true,
    });

    expect(productResult.success).toBe(false);
    expect(categoryResult.success).toBe(true);
  });

  it('rejects legacy feature objects and unapproved product fields', () => {
    const result = productSchema.safeParse({
      id: 'radio-sample',
      name: '示例数字对讲机',
      slug: 'sample-radio',
      categoryId: 'two-way-radio',
      coverImage: '/images/products/sample-radio.svg',
      keyFeatures: [{ label: '数字通信', color: 'blue' }],
      hasDocuments: true,
      published: true,
    });

    expect(result.success).toBe(false);
  });

  it('reports broken product category references', () => {
    const errors = validateContentReferences({
      categories: [{ id: 'two-way-radio', slug: 'two-way-radio' }],
      products: [
        {
          id: 'radio-sample',
          categoryId: 'missing-category',
          keyFeatures: [],
          published: true,
        },
      ],
      features: [],
    });

    expect(errors).toEqual([
      'Unknown categoryId: missing-category',
    ]);
  });

  it('rejects duplicate category and product IDs', () => {
    const errors = validateContentReferences({
      categories: [
        { id: 'two-way-radio', slug: 'two-way-radio' },
        { id: 'two-way-radio', slug: 'radio-duplicate' },
      ],
      products: [
        {
          id: 'radio-sample',
          categoryId: 'two-way-radio',
          keyFeatures: [],
          published: true,
        },
        {
          id: 'radio-sample',
          categoryId: 'two-way-radio',
          keyFeatures: [],
          published: true,
        },
      ],
      features: [],
    });

    expect(errors).toEqual([
      'Duplicate product category id: two-way-radio',
      'Duplicate product id: radio-sample',
    ]);
  });

  it('reports an unknown feature used by a published product', () => {
    const errors = validateContentReferences({
      categories: [{ id: 'two-way-radio', slug: 'two-way-radio' }],
      products: [
        {
          id: 'radio-sample',
          categoryId: 'two-way-radio',
          keyFeatures: ['不存在的功能'],
          published: true,
        },
      ],
      features: [{ name: '一键对频', icon: 'scan-line' }],
    });

    expect(errors).toContain(
      'Unknown product feature "不存在的功能" referenced by product "radio-sample"',
    );
  });

  it('reports duplicate feature names', () => {
    const errors = validateContentReferences({
      categories: [],
      products: [],
      features: [
        { name: '一键对频', icon: 'scan-line' },
        { name: '一键对频', icon: 'battery' },
      ],
    });

    expect(errors).toContain('Duplicate product feature name: 一键对频');
  });

  it('validates product references in nested content directories', () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'shengborun-content-'));
    const nestedCategoryDirectory = path.join(
      fixtureRoot,
      'product-categories',
      'nested',
    );

    try {
      mkdirSync(nestedCategoryDirectory, { recursive: true });
      mkdirSync(path.join(fixtureRoot, 'products'));
      mkdirSync(path.join(fixtureRoot, 'product-features'));
      writeFileSync(
        path.join(nestedCategoryDirectory, 'two-way-radio.json'),
        JSON.stringify({
          id: 'two-way-radio',
          slug: 'two-way-radio',
          published: true,
        }),
        'utf8',
      );
      writeFileSync(path.join(fixtureRoot, 'products', 'draft.json'), '', 'utf8');
      writeFileSync(
        path.join(fixtureRoot, 'products', 'broken.json'),
        JSON.stringify({
          id: 'broken',
          categoryId: 'missing-category',
          keyFeatures: ['一键对频'],
          published: true,
        }),
        'utf8',
      );
      writeFileSync(
        path.join(fixtureRoot, 'product-features', 'features.json'),
        JSON.stringify([{ name: '一键对频', icon: 'scan-line' }]),
        'utf8',
      );

      const scriptPath = path.resolve(
        process.cwd(),
        'scripts',
        'validate-content.mjs',
      );
      const result = spawnSync(process.execPath, [scriptPath, fixtureRoot], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Unknown categoryId: missing-category');
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('accepts category slugs independently from legacy support routes', () => {
    const result = productCategorySchema.safeParse({
      id: 'shortwave-radio',
      name: '短波通信',
      slug: 'shortwave-radio',
      sortOrder: 2,
      published: true,
    });

    expect(result.success).toBe(true);
  });

  it('keeps solution visuals separate from product relationships', () => {
    const validResult = solutionSchema.safeParse({
      name: '应急通信示例方案',
      slug: 'sample-solution',
      summary: '面向应急现场的示例通信方案，用于演示解决方案内容结构。',
      coreNeeds: ['快速建立现场通信'],
      solutionDesign: '通过便携通信设备建立临时协作网络。',
      features: ['部署简洁'],
      bodyImages: [
        { src: '/images/solutions/sample-scene.svg', alt: '示例现场通信场景' },
      ],
      systemDiagram: {
        src: '/images/solutions/sample-system.svg',
        alt: '示例通信系统结构图',
      },
      published: true,
    });
    const relatedProductResult = solutionSchema.safeParse({
      name: '错误关联方案',
      slug: 'related-solution',
      summary: '此示例用于确认解决方案不能建立产品关联字段。',
      coreNeeds: ['验证内容边界'],
      solutionDesign: '不应通过字段直接关联产品。',
      features: [],
      recommendedProductIds: ['radio-sample'],
      published: true,
    });

    expect(validResult.success).toBe(true);
    expect(relatedProductResult.success).toBe(false);
  });

  it('requires minimal global site settings', () => {
    const validResult = siteSettingsSchema.safeParse({
      siteName: '盛博润',
      siteDescription: '盛博润通信产品与解决方案官方网站。',
    });

    expect(validResult.success).toBe(true);
    expect(siteSettingsSchema.safeParse({ siteName: '盛博润' }).success).toBe(
      false,
    );
  });
});
