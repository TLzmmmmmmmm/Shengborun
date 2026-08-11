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

import {
  PRODUCT_TAG_COLORS,
  RESERVED_SUPPORT_SLUGS,
  documentSchema,
  faqSchema,
  productCategorySchema,
  productSchema,
  siteSettingsSchema,
  solutionSchema,
  validateContentReferences,
} from '../../src/lib/content-rules';

describe('content rules', () => {
  it('reserves FAQ and limits feature colors', () => {
    expect(RESERVED_SUPPORT_SLUGS).toContain('faq');
    expect(PRODUCT_TAG_COLORS).toEqual([
      'teal',
      'blue',
      'green',
      'amber',
      'violet',
      'gray',
    ]);
  });

  it('accepts the approved product fields and controlled tag colors', () => {
    const result = productSchema.safeParse({
      id: 'radio-sample',
      name: '示例数字对讲机',
      slug: 'sample-radio',
      categoryId: 'two-way-radio',
      coverImage: '/images/products/sample-radio.svg',
      keyFeatures: [{ label: '数字通信', color: 'blue' }],
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

  it('rejects unapproved product fields and arbitrary tag colors', () => {
    const result = productSchema.safeParse({
      id: 'radio-sample',
      name: '示例数字对讲机',
      slug: 'sample-radio',
      categoryId: 'two-way-radio',
      coverImage: '/images/products/sample-radio.svg',
      keyFeatures: [{ label: '数字通信', color: 'red' }],
      hasDocuments: true,
      published: true,
    });

    expect(result.success).toBe(false);
  });

  it('reports reserved category slugs and broken content references', () => {
    const errors = validateContentReferences({
      categories: [{ id: 'reserved-category', slug: 'faq' }],
      products: [
        {
          id: 'radio-sample',
          categoryId: 'missing-category',
          keyFeatures: [],
        },
      ],
      documents: [{ productId: 'missing-product' }],
    });

    expect(errors).toEqual([
      'Product category slug "faq" is reserved.',
      'Unknown categoryId: missing-category',
      'Unknown productId: missing-product',
    ]);
  });

  it('requires a feature label to keep the same color across products', () => {
    const errors = validateContentReferences({
      categories: [{ id: 'two-way-radio', slug: 'two-way-radio' }],
      products: [
        {
          id: 'radio-one',
          categoryId: 'two-way-radio',
          keyFeatures: [{ label: '数字通信', color: 'blue' }],
        },
        {
          id: 'radio-two',
          categoryId: 'two-way-radio',
          keyFeatures: [{ label: '数字通信', color: 'teal' }],
        },
      ],
      documents: [],
    });

    expect(errors).toEqual([
      'Feature label "数字通信" uses both "blue" and "teal".',
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
        },
        {
          id: 'radio-sample',
          categoryId: 'two-way-radio',
          keyFeatures: [],
        },
      ],
      documents: [{ productId: 'radio-sample' }],
    });

    expect(errors).toEqual([
      'Duplicate product category id: two-way-radio',
      'Duplicate product id: radio-sample',
    ]);
  });

  it('validates product categories in nested content directories', () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'shengborun-content-'));
    const nestedCategoryDirectory = path.join(
      fixtureRoot,
      'product-categories',
      'nested',
    );

    try {
      mkdirSync(nestedCategoryDirectory, { recursive: true });
      mkdirSync(path.join(fixtureRoot, 'products'));
      mkdirSync(path.join(fixtureRoot, 'documents'));
      writeFileSync(
        path.join(nestedCategoryDirectory, 'reserved.json'),
        JSON.stringify({ id: 'reserved', slug: 'faq' }),
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
      expect(result.stderr).toContain(
        'Product category slug "faq" is reserved.',
      );
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('rejects FAQ as a product category slug', () => {
    const result = productCategorySchema.safeParse({
      id: 'reserved-category',
      name: '错误类别',
      slug: 'faq',
      published: true,
    });

    expect(result.success).toBe(false);
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

  it('requires documents to reference a product and provide a local PDF', () => {
    const validResult = documentSchema.safeParse({
      productId: 'radio-sample',
      documentName: '示例数字对讲机使用说明',
      slug: 'sample-radio-manual',
      pdfFile: '/documents/sample-radio-manual.pdf',
      published: true,
    });
    const missingPdfResult = documentSchema.safeParse({
      productId: 'radio-sample',
      documentName: '缺少 PDF 的说明',
      slug: 'manual-without-pdf',
      published: true,
    });

    expect(validResult.success).toBe(true);
    expect(missingPdfResult.success).toBe(false);
  });

  it('models FAQ as ordered ungrouped questions', () => {
    const validResult = faqSchema.safeParse({
      id: 'power-on',
      question: '设备无法开机时怎么办？',
      answer: '请先确认电池已正确安装并有足够电量。',
      sortOrder: 1,
      published: true,
    });
    const groupedResult = faqSchema.safeParse({
      id: 'grouped-question',
      question: '这是分类问题吗？',
      answer: 'FAQ 不建立分类。',
      category: '设备使用',
      sortOrder: 2,
      published: true,
    });

    expect(validResult.success).toBe(true);
    expect(groupedResult.success).toBe(false);
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
