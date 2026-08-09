# 盛博润静态网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Astro 从零构建盛博润简体中文企业官网，以静态 HTML 替换旧网站，并将构建产物通过 FTP 上传至现有服务器。

**Architecture:** 网站采用 Astro 6 默认静态输出模式；产品、解决方案、说明文档和常见问题使用本地结构化内容集合，在构建阶段通过 `getStaticPaths()` 生成全部页面。服务器只托管 `dist/` 中的 HTML、CSS、JavaScript、图片和 PDF，不运行 Node.js、数据库或后台服务。

**Tech Stack:** Astro 6、TypeScript strict、Astro Content Collections、Zod、原生 CSS、少量原生浏览器 JavaScript、Vitest、Playwright、`@astrojs/sitemap`、IIS `web.config`、FTP。

## Global Constraints

- 网站只提供简体中文，不实现访客登录、支付或信息提交。
- 顶部导航固定为：首页、产品中心、解决方案、技术支持、关于我们。
- Logo 不设置返回首页链接；只有“首页”导航返回首页。
- 网站使用黑、白、灰作为主要背景，品牌按钮颜色为 `#00B7B5`。
- 主要按钮默认使用 `#00B7B5` 背景和 `#202B33` 文字。
- 产品详情必须位于 `/products/{category-slug}/{product-slug}`。
- 使用说明必须位于 `/support/{category-slug}/{document-slug}`，`faq` 为保留 slug。
- 产品无论是否有使用说明，都必须显示在产品中心、类别页和产品详情页。
- `/support` 只显示前三个常见问题，只有“查看更多”按钮链接到 `/support/faq`。
- 页脚不显示电话、邮箱、地址或工作时间；联系信息只在 `/about#contact` 展示。
- 产品与解决方案不建立关联字段。
- 说明文档同时提供网页正文和 PDF 下载。
- 页面必须在 320px 及以上宽度正常使用，并满足键盘操作、可见焦点和 WCAG 2.1 AA 文字对比度。
- 不在运行服务器上安装 Node.js；所有构建和测试均在本地或 CI 完成。

## 文件结构

```text
Shengborun/
├─ astro.config.mjs                 # 静态输出、站点域名、sitemap 配置
├─ package.json                     # 构建、测试和检查命令
├─ tsconfig.json                    # TypeScript strict 配置
├─ vitest.config.ts                 # 单元测试配置
├─ playwright.config.ts             # 端到端测试配置
├─ public/
│  ├─ brand/                        # Logo 和品牌图片
│  ├─ documents/                    # 可下载 PDF
│  ├─ images/                       # 产品与解决方案图片
│  └─ web.config                    # HTTPS、旧 URL 与静态站点规则
├─ scripts/
│  ├─ validate-content.mjs          # 内容引用与保留 slug 检查
│  └─ generate-legacy-redirects.mjs # 根据旧 URL 清单生成 IIS 规则
├─ data/
│  └─ legacy-urls.example.txt       # 旧 URL 对照表格式示例
├─ src/
│  ├─ content.config.ts             # 所有内容集合的 Zod schema
│  ├─ content/
│  │  ├─ product-categories/        # 产品类别 JSON
│  │  ├─ products/                  # 产品 Markdown
│  │  ├─ solutions/                 # 解决方案 Markdown
│  │  ├─ documents/                 # 使用说明 Markdown
│  │  ├─ faq/questions.json         # FAQ 数据
│  │  └─ site/                      # 关于我们、页脚和全站设置
│  ├─ components/
│  │  ├─ layout/                    # Header、Footer、Breadcrumbs、SeoHead
│  │  ├─ products/                  # 产品卡片、标签、参数筛选和参数表
│  │  ├─ solutions/                 # 解决方案卡片与正文组件
│  │  └─ support/                   # 文档列表和 FAQ 组件
│  ├─ layouts/BaseLayout.astro      # 全站 HTML 框架
│  ├─ lib/                          # 内容查询、URL 和 SEO helpers
│  ├─ pages/                        # SiteMap.md 对应的页面路由
│  └─ styles/                       # tokens、global、components
└─ tests/
   ├─ unit/                         # schema、查询和 URL 单元测试
   └─ e2e/                          # 导航、页面、筛选与下载测试
```

---

### Task 1: 静态工程基础与测试框架

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/pages/index.astro`
- Create: `tests/unit/smoke.test.ts`
- Create: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `npm run dev`、`npm run build`、`npm run test:unit`、`npm run test:e2e`、`npm run check`。
- Produces: 默认静态输出目录 `dist/`。

- [ ] **Step 1: 写入最小工程与命令**

```json
{
  "name": "shengborun-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "npm run validate:content && astro check && astro build",
    "check": "astro check",
    "validate:content": "node scripts/validate-content.mjs",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run build && npm run test:e2e"
  }
}
```

- [ ] **Step 2: 配置静态输出与 sitemap**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.shengborun.com',
  output: 'static',
  build: { format: 'directory' },
  integrations: [sitemap()]
});
```

- [ ] **Step 3: 写入失败的烟雾测试并运行**

```ts
import { describe, expect, it } from 'vitest';

describe('site foundation', () => {
  it('uses the public production origin', () => {
    expect(new URL('https://www.shengborun.com').protocol).toBe('https:');
  });
});
```

Run: `npm run test:unit`
Expected: 首次安装依赖前失败；安装并配置后 PASS。

- [ ] **Step 4: 安装 Astro、官方 sitemap、Vitest 与 Playwright，并生成锁文件**

Run: `npm install astro@^6 @astrojs/check @astrojs/sitemap typescript vitest @playwright/test`

Run: `npx playwright install chromium`

- [ ] **Step 5: 验证基础工程**

Run: `npm run check && npm run test:unit && npm run build`

Expected: 三个命令均退出 0，`dist/index.html` 存在。

- [ ] **Step 6: 提交**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/pages/index.astro tests
git commit -m "chore: initialize static Astro site"
```

---

### Task 2: 内容集合、字段校验与示例数据

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content-rules.ts`
- Create: `src/content/product-categories/two-way-radio.json`
- Create: `src/content/products/sample-radio.md`
- Create: `src/content/solutions/sample-solution.md`
- Create: `src/content/documents/sample-radio-manual.md`
- Create: `src/content/faq/questions.json`
- Create: `src/content/site/settings.json`
- Create: `scripts/validate-content.mjs`
- Test: `tests/unit/content-schema.test.ts`

**Interfaces:**
- Produces collections: `productCategories`、`products`、`solutions`、`documents`、`faq`、`site`。
- Produces product fields exactly matching `SiteMap.md`.
- Produces document references through stable product `id`; no manual `hasDocuments` field.

- [ ] **Step 1: 写入失败的 schema 测试**

```ts
import { describe, expect, it } from 'vitest';
import { PRODUCT_TAG_COLORS, RESERVED_SUPPORT_SLUGS } from '../../src/lib/content-rules';

describe('content rules', () => {
  it('reserves FAQ and limits feature colors', () => {
    expect(RESERVED_SUPPORT_SLUGS).toContain('faq');
    expect(PRODUCT_TAG_COLORS).toEqual(['teal', 'blue', 'green', 'amber', 'violet', 'gray']);
  });
});
```

Run: `npm run test:unit`
Expected: FAIL because `src/lib/content-rules.ts` does not exist.

- [ ] **Step 2: 定义内容规则和产品 schema**

```ts
export const RESERVED_SUPPORT_SLUGS = ['faq'] as const;
export const PRODUCT_TAG_COLORS = ['teal', 'blue', 'green', 'amber', 'violet', 'gray'] as const;
```

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { PRODUCT_TAG_COLORS } from './lib/content-rules';

const product = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    categoryId: z.string().min(1),
    shortDescription: z.string().min(30).max(80),
    coverImage: z.string().min(1),
    galleryImages: z.array(z.string()).default([]),
    keyFeatures: z.array(z.object({
      label: z.string().min(1),
      color: z.enum(PRODUCT_TAG_COLORS)
    })).default([]),
    productFeatures: z.string().optional(),
    technicalParameters: z.array(z.object({
      group: z.string().optional(),
      items: z.array(z.object({ name: z.string(), value: z.string() }))
    })).default([]),
    sortOrder: z.number().int().default(0),
    published: z.boolean(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoPath: z.string().startsWith('/').optional(),
    seoImage: z.string().optional()
  })
});
```

- [ ] **Step 3: 定义解决方案、文档、FAQ 和站点 schema**

要求：解决方案允许 `bodyImages` 和 `systemDiagram`；产品 schema 不允许这两个字段；文档必须包含 `productId`、`documentName`、`pdfFile`、`published`；FAQ 为不分组的有序问题数组。

- [ ] **Step 4: 实现跨集合验证脚本**

```js
const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

for (const category of categories) {
  if (category.slug === 'faq') fail('Product category slug "faq" is reserved.');
}
for (const document of documents) {
  if (!productIds.has(document.productId)) fail(`Unknown productId: ${document.productId}`);
}
```

- [ ] **Step 5: 添加最小真实形态示例内容并验证**

Run: `npm run validate:content && npm run test:unit && npm run check`

Expected: 全部 PASS；将产品类别 slug 改为 `faq` 时验证脚本必须 FAIL，恢复后 PASS。

- [ ] **Step 6: 提交**

```bash
git add src/content.config.ts src/content src/lib/content-rules.ts scripts/validate-content.mjs tests/unit/content-schema.test.ts
git commit -m "feat: define validated website content model"
```

---

### Task 3: 品牌样式、全站布局、顶部导航和页脚

**Files:**
- Create: `public/brand/logo.png`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/layout/Header.astro`
- Create: `src/components/layout/Footer.astro`
- Create: `src/components/layout/Breadcrumbs.astro`
- Create: `src/components/layout/SeoHead.astro`
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- `BaseLayout` consumes `{ title, description, canonicalPath, image?, breadcrumbs? }`.
- `Header` exposes only the five approved top-level navigation items.
- `Footer` consumes product categories and published solutions, and renders five navigation columns.

- [ ] **Step 1: 写入失败的布局端到端测试**

```ts
test('header and footer follow the approved structure', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link')).toHaveCount(5);
  await expect(page.locator('header a').filter({ has: page.locator('img[alt="盛博润"]') })).toHaveCount(0);
  await expect(page.locator('footer')).not.toContainText('工作时间');
  await expect(page.getByRole('link', { name: '隐私政策' })).toHaveAttribute('href', '/privacy/');
});
```

Run: `npm run test:e2e -- layout.spec.ts`
Expected: FAIL because layout components do not exist.

- [ ] **Step 2: 建立品牌 tokens**

```css
:root {
  --brand-teal: #00b7b5;
  --brand-graphite: #202b33;
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --surface: #ffffff;
  --surface-muted: #f5f5f7;
  --border: #d2d2d7;
  --focus: #007c7b;
}
```

- [ ] **Step 3: 实现 BaseLayout、SEO head、可见焦点和跳至正文链接**

要求：每页只有一个 `h1`；`lang="zh-CN"`；包含 canonical、description、Open Graph、sitemap link；正文入口为 `<main id="main-content">`。

- [ ] **Step 4: 实现 Header**

要求：Logo 使用非链接容器；导航顺序固定；桌面和移动菜单均可键盘操作；不显示电话咨询按钮。

- [ ] **Step 5: 实现 Footer**

要求：桌面显示产品中心、解决方案、技术支持、关于我们、法律信息五栏；移动端使用原生 `<details>`；不显示任何联系信息；锚点与 `SiteMap.md` 完全一致。

- [ ] **Step 6: 验证布局**

Run: `npm run check && npm run test:e2e -- layout.spec.ts`

Expected: PASS；在 320px、768px、1440px 三种宽度无水平滚动。

- [ ] **Step 7: 提交**

```bash
git add public/brand src/styles src/layouts src/components/layout tests/e2e/layout.spec.ts
git commit -m "feat: add brand layout navigation and footer"
```

---

### Task 4: 产品中心、参数筛选和产品详情

**Files:**
- Create: `src/lib/products.ts`
- Create: `src/components/products/ProductCard.astro`
- Create: `src/components/products/FeatureTags.astro`
- Create: `src/components/products/TechnicalParameters.astro`
- Create: `src/components/products/ProductFilters.astro`
- Create: `src/pages/products/index.astro`
- Create: `src/pages/products/[category].astro`
- Create: `src/pages/products/[category]/[product].astro`
- Test: `tests/unit/products.test.ts`
- Test: `tests/e2e/products.spec.ts`

**Interfaces:**
- `getPublishedProducts()` returns only `published: true`, sorted by `sortOrder` then `name`.
- `getDocumentsForProduct(productId: string)` returns published documents; it never controls product visibility.
- `ProductFilters` consumes filter definitions derived from populated parameter names; no scenario filter and no comparison feature.

- [ ] **Step 1: 写入失败的产品查询测试**

```ts
it('keeps products visible when they have no documents', () => {
  const visible = selectVisibleProducts(products, []);
  expect(visible.map((item) => item.id)).toContain('radio-without-manual');
});
```

Run: `npm run test:unit -- products.test.ts`
Expected: FAIL because `selectVisibleProducts` does not exist.

- [ ] **Step 2: 实现产品查询、类别校验与文档查询**

```ts
export const selectVisibleProducts = (products: Product[], _documents: Document[]) =>
  products.filter((product) => product.published);
```

- [ ] **Step 3: 实现产品列表和类别页面**

要求：所有已发布产品显示；卡片使用 `shortDescription`；筛选参数只从实际内容生成；筛选无结果时显示明确提示和重置按钮。

- [ ] **Step 4: 实现产品详情页面**

要求：URL 为 `/products/{category}/{product}`；展示主图、图集、不同颜色关键功能标签、产品特点和参数表；有文档时显示网页阅读与 PDF 入口，无文档时不显示空白资料区。

- [ ] **Step 5: 验证筛选和路由**

```ts
test('product without a manual still has a detail page', async ({ page }) => {
  await page.goto('/products/two-way-radio/radio-without-manual/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('使用说明')).toHaveCount(0);
});
```

Run: `npm run test:unit -- products.test.ts && npm run test:e2e -- products.spec.ts`
Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/lib/products.ts src/components/products src/pages/products tests/unit/products.test.ts tests/e2e/products.spec.ts
git commit -m "feat: build product catalog and detail pages"
```

---

### Task 5: 解决方案列表与详情

**Files:**
- Create: `src/lib/solutions.ts`
- Create: `src/components/solutions/SolutionCard.astro`
- Create: `src/pages/solutions/index.astro`
- Create: `src/pages/solutions/[solution].astro`
- Test: `tests/e2e/solutions.spec.ts`

**Interfaces:**
- `getPublishedSolutions()` returns published solutions sorted by `sortOrder`.
- Solution fields include `summary`、`coreNeeds`、`solutionDesign`、`features`、`bodyImages?`、`systemDiagram?`.
- No product ID, recommended product, industry, or scenario relation field.

- [ ] **Step 1: 写入失败的解决方案页面测试**

```ts
test('solution detail contains contact CTA and no product recommendations', async ({ page }) => {
  await page.goto('/solutions/sample-solution/');
  await expect(page.getByRole('link', { name: '联系我们' })).toHaveAttribute('href', '/about/#contact');
  await expect(page.getByText('推荐产品')).toHaveCount(0);
});
```

- [ ] **Step 2: 实现列表与详情静态路由**

使用 `getCollection('solutions')` 和 `getStaticPaths()`；方案名称直接表达行业或场景，不生成行业分类路由。

- [ ] **Step 3: 实现可选图片与系统结构图渲染**

只有字段存在时才渲染对应区块；所有图片必须有内容维护者填写的 `alt` 文本。

- [ ] **Step 4: 验证**

Run: `npm run check && npm run test:e2e -- solutions.spec.ts`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/lib/solutions.ts src/components/solutions src/pages/solutions tests/e2e/solutions.spec.ts
git commit -m "feat: add solution listing and detail pages"
```

---

### Task 6: 技术支持、使用说明、FAQ 与售后区块

**Files:**
- Create: `src/lib/support.ts`
- Create: `src/components/support/DocumentGroups.astro`
- Create: `src/components/support/FaqList.astro`
- Create: `src/pages/support/index.astro`
- Create: `src/pages/support/faq.astro`
- Create: `src/pages/support/[category].astro`
- Create: `src/pages/support/[category]/[document].astro`
- Test: `tests/unit/support.test.ts`
- Test: `tests/e2e/support.spec.ts`

**Interfaces:**
- `getDocumentCategories()` returns only categories containing at least one published document.
- `groupDocumentsByProduct(categoryId)` omits products with no documents and groups one or many documents under each product.
- `/support/faq` is a static route and takes precedence over `/support/[category]`.

- [ ] **Step 1: 写入失败的支持查询测试**

```ts
it('omits undocumented products from manuals only', () => {
  const groups = groupDocumentsByProduct('two-way-radio', products, documents);
  expect(groups.some((group) => group.productId === 'radio-without-manual')).toBe(false);
});
```

- [ ] **Step 2: 实现支持查询 helpers**

确保文档类别中没有 `faq`；每个分组按产品排序，每个产品下按文档 `sortOrder` 排序。

- [ ] **Step 3: 实现 `/support`**

页面按顺序包含 `#manuals`、`#faq`、`#after-sales`。FAQ 区展示前三个问题；标题和区块不包裹链接；只有“查看更多”按钮链接 `/support/faq/`。售后区按钮链接 `/about/#contact`。

- [ ] **Step 4: 实现类别资料页和文档页**

类别路由为 `/support/{category}/`；文档路由为 `/support/{category}/{document}/`。文档页渲染完整 Markdown 正文和 PDF 下载链接，PDF 添加 `download` 属性并显示文件类型。

- [ ] **Step 5: 实现完整 FAQ 页面**

全部问题按一个连续列表显示，不分组，不包含售后政策正文。

- [ ] **Step 6: 验证路由冲突和交互**

```ts
test('only the more button opens all FAQ', async ({ page }) => {
  await page.goto('/support/');
  await expect(page.getByRole('heading', { name: '常见问题' })).not.toHaveAttribute('href');
  await expect(page.getByRole('link', { name: '查看更多' })).toHaveAttribute('href', '/support/faq/');
});
```

Run: `npm run test:unit -- support.test.ts && npm run test:e2e -- support.spec.ts`
Expected: PASS；`/support/faq/` 显示 FAQ 而不是产品类别页。

- [ ] **Step 7: 提交**

```bash
git add src/lib/support.ts src/components/support src/pages/support tests/unit/support.test.ts tests/e2e/support.spec.ts
git commit -m "feat: add support manuals FAQ and after-sales sections"
```

---

### Task 7: 首页、关于我们、法律页面、SEO 与百度统计

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/privacy.astro`
- Create: `src/pages/legal.astro`
- Create: `src/pages/robots.txt.ts`
- Create: `src/components/layout/BaiduAnalytics.astro`
- Create: `src/lib/seo.ts`
- Test: `tests/e2e/static-pages.spec.ts`
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- About anchors: `company`、`qualifications`、`contact`.
- Support anchors: `manuals`、`faq`、`after-sales`.
- SEO uses manually supplied values first, then deterministic content-derived fallbacks.
- Baidu Analytics consumes `PUBLIC_BAIDU_ANALYTICS_ID`; no ID means no analytics script in local/test builds.

- [ ] **Step 1: 写入失败的静态页面和 SEO 测试**

```ts
it('prefers manually edited SEO values', () => {
  expect(resolveSeo({ seoTitle: '人工标题', name: '产品名称' }).title).toBe('人工标题');
});
```

- [ ] **Step 2: 实现首页访客路径**

首页分别提供“查找产品”“查看解决方案”“获取技术支持”入口，不在首页复制完整筛选、FAQ 或联系信息。

- [ ] **Step 3: 实现 About 单页静态区块**

公司简介、合规与资质、联系我们均在 `/about/`；不存在 `/about/company`、`/about/qualifications` 或 `/contact` 页面。联系区展示电话、邮箱、地址、工作时间。

- [ ] **Step 4: 实现 Privacy、Legal、SEO、robots 和 sitemap 发现链接**

`robots.txt` 指向 `https://www.shengborun.com/sitemap-index.xml`；canonical 使用 HTTPS；SEO path 只接受以 `/` 开头的相对路径。

- [ ] **Step 5: 实现百度统计的可控注入**

```astro
---
const id = import.meta.env.PUBLIC_BAIDU_ANALYTICS_ID;
---
{id && (
  <script is:inline define:vars={{ id }}>
    window._hmt = window._hmt || [];
    const script = document.createElement('script');
    script.src = `https://hm.baidu.com/hm.js?${id}`;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  </script>
)}
```

部署前由站点所有者提供统计 ID；代码库不提交账号凭证。

- [ ] **Step 6: 验证**

Run: `npm run test:unit -- seo.test.ts && npm run test:e2e -- static-pages.spec.ts && npm run build`

Expected: PASS；`dist/sitemap-index.xml`、`dist/robots.txt`、`dist/about/index.html` 存在。

- [ ] **Step 7: 提交**

```bash
git add src/pages src/components/layout/BaiduAnalytics.astro src/lib/seo.ts tests/unit/seo.test.ts tests/e2e/static-pages.spec.ts
git commit -m "feat: add static pages SEO and analytics support"
```

---

### Task 8: 内容验收、旧 URL、IIS/FTP 部署与回滚

**Files:**
- Create: `.gitignore`
- Create: `data/legacy-urls.example.txt`
- Local input, not committed: `data/legacy-urls.txt`
- Create: `scripts/generate-legacy-redirects.mjs`
- Create: `public/web.config`
- Create: `scripts/verify-dist.mjs`
- Create: `docs/deployment.md`
- Test: `tests/unit/legacy-redirects.test.ts`
- Test: `tests/e2e/site-acceptance.spec.ts`

**Interfaces:**
- `generate-legacy-redirects.mjs` consumes one legacy absolute or relative URL per line and emits exact IIS rewrite rules.
- Unmatched legacy URLs may redirect to `/`; valid new URLs must never be caught by the legacy rule.
- `verify-dist.mjs` checks required HTML, PDF, sitemap, robots and web.config files before FTP upload.

- [ ] **Step 1: 写入失败的旧 URL 规则测试**

```ts
it('maps a legacy URL to the approved target without catching new routes', () => {
  const rules = buildRedirectRules(['/old-product.asp|/']);
  expect(rules).toContain('old-product\\.asp');
  expect(rules).not.toContain('products/.*');
});
```

- [ ] **Step 2: 实现旧 URL 生成器**

输入格式为 `旧路径|新路径`。当新路径为空时使用 `/`；生成规则前对旧路径进行正则转义；重复路径、外部目标或包含凭证的 URL 必须使脚本退出 1。

将 `data/legacy-urls.txt` 加入 `.gitignore`，避免把未审核的爬虫原始数据提交到代码库。Task 8 开始执行前，站点所有者必须提供爬虫导出的 URL 清单；没有该输入时只完成生成器及其测试，不生成生产重定向规则。

- [ ] **Step 3: 实现 IIS 配置**

`web.config` 要求：HTTP 永久跳转 HTTPS；保留真实静态文件；应用明确的旧 URL 规则；未知新路径返回 404，不做全站模糊重写。

- [ ] **Step 4: 建立完整验收测试**

覆盖：五项顶部导航、Logo 不可点击、页脚五栏、产品无文档仍显示、标签颜色类、解决方案无推荐产品、FAQ 只有查看更多可跳转、About 锚点、隐私和法律页面、PDF 下载、320px 无水平溢出。

- [ ] **Step 5: 验证构建产物**

Run: `npm test && node scripts/verify-dist.mjs`

Expected: 全部 PASS；`dist/` 不包含服务器代码、数据库文件、源 Markdown、测试文件或环境变量文件。

- [ ] **Step 6: 编写 FTP 部署和回滚步骤**

`docs/deployment.md` 必须规定：上传前备份现站目录；先上传至临时目录并抽查；维护窗口内切换目录；检查首页、产品、文档、FAQ、PDF、HTTPS、sitemap 和统计；失败时恢复备份目录。不得把 FTP 密码写入代码库。

- [ ] **Step 7: 在服务器升级前验证兼容性**

检查现有主机是否支持 HTTPS 证书、IIS URL Rewrite 和自定义 `web.config`。如任一项不支持，只升级到满足这三项的最低价 Windows 静态主机；网站本身不需要数据库、SSR、2 核以上 CPU 或 2GB 以上内存。

- [ ] **Step 8: 提交**

```bash
git add .gitignore data/legacy-urls.example.txt scripts public/web.config docs/deployment.md tests/unit/legacy-redirects.test.ts tests/e2e/site-acceptance.spec.ts
git commit -m "chore: add static deployment validation and redirects"
```

---

## 全计划最终验证

- [ ] Run: `npm ci`
- [ ] Run: `npm run validate:content`
- [ ] Run: `npm run check`
- [ ] Run: `npm run test:unit`
- [ ] Run: `npm run build`
- [ ] Run: `npm run test:e2e`
- [ ] Run: `node scripts/verify-dist.mjs`
- [ ] 检查 `git status --short` 为空。
- [ ] 使用与参考图相同宽度的页面截图复核 Header、Footer、首页和产品详情的视觉层级。

## 实施依据

- `SiteMap.md`
- `docs/superpowers/specs/2026-08-08-brand-color-design.md`
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro Routing: https://docs.astro.build/en/guides/routing/
- Astro Testing: https://docs.astro.build/en/guides/testing/
- Astro Sitemap: https://docs.astro.build/en/guides/integrations-guide/sitemap/
