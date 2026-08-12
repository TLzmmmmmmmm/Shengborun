# Task 3 品牌布局视觉调整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 高保真重制盛博润 Logo，并完成粘性矮 Header、受控全站边距、动态 Footer breadcrumb 和华为式轻灰 Footer。

**Architecture:** `BaseLayout` 继续接收页面 breadcrumb，通过一个纯函数补齐首页节点后传给 `Footer`；`Footer` 复用 `Breadcrumbs` 组件并保留内容集合驱动的五栏导航。Header、全站容器和 Footer 的视觉规则分别留在现有组件与 token 文件中；Logo 使用内置 ImageGen 高保真编辑，再通过确定性的透明化、双色归一、裁切和居中处理生成最终 PNG。

**Tech Stack:** Astro 6、TypeScript strict、原生 CSS、Vitest、Playwright、内置 ImageGen、Python Pillow（仅用于 Logo 的确定性本地后处理）。

## Global Constraints

- 工作目录固定为 `D:\Shengborun\.worktrees\site-foundation`，分支固定为 `codex/site-foundation`。
- 开始前必须确认工作区没有用户未提交修改，且 `HEAD` 与 `origin/codex/site-foundation` 同步；发现差异立即汇报，不重置、覆盖或删除。
- 所有浏览器测试只能访问 `http://127.0.0.1:4321`。
- 不访问或测试 `www.shengborun.com`，不修改 DNS、HTTPS、IIS、服务器或 FTP，不部署网站。
- Logo 必须保留 SBR 图形轮廓、三个青绿色节点及其连接关系，并准确保留“盛博润”三个汉字。
- Logo 深色统一为 `#1D1D1F`，青绿色统一为 `#00B7B5`；不增加渐变、阴影、描边、口号或水印。
- Logo 最终像素尺寸根据主体比例和小尺寸清晰度决定，不以 `1200 × 336` 或其他任意预设画布为目标。
- Logo 画布主体上下留白等长、左右留白等长，主体完整居中；桌面显示宽度 144px，移动端显示宽度 120px。
- 桌面 Header 高度 54px，移动端 Header 高度 48px；Header 使用 `position: sticky; top: 0`。
- `.site-container` 使用完整宽度和 `clamp(1rem, 6.25vw, 7.5rem)` 对称边距；超宽屏单侧边距不超过 120px。
- Footer 背景为 `#F5F5F7`，栏目标题为 `#000000`，链接和 breadcrumb 为 `#6E6E73`，分隔线为 `#E8E8ED`。
- Footer breadcrumb：首页为“首页”；内页为“首页 / 当前页面”，可继续扩展中间层级；页面主体中不重复显示 breadcrumb。
- Footer 法务区必须是三个独立信息单元：`版权所有 © 2026 北京盛博润通信设备有限公司。`、`ICP备案（待确认）`、`公安联网备案（待确认）`。
- 两项备案的显示文字和正式 URL 尚未确认；本阶段使用非链接文本，不得添加 `#`、猜测 URL 或其他虚假 `href`。
- 不增加 Footer 搜索框、商城链接行、社交图标或附加底部链接。
- 本阶段完成全部验证后只进行一次 `git add → commit → push`，然后停下等待确认。

## File Map

- Modify: `public/brand/logo.png` — 最终透明 Logo 资产。
- Create: `src/lib/breadcrumbs.ts` — breadcrumb 类型和 Footer 默认首页规则。
- Modify: `src/layouts/BaseLayout.astro` — 标准化 breadcrumb 并只传给 Footer。
- Modify: `src/components/layout/Breadcrumbs.astro` — 提供适合 Footer 容器的语义和紧凑样式。
- Modify: `src/components/layout/Footer.astro` — breadcrumb、轻灰五栏导航和三部分法务区。
- Modify: `src/components/layout/Header.astro` — 新 Logo 元数据、54/48px Header、粘性定位。
- Modify: `src/styles/tokens.css` — 受控页面边距，移除固定内容宽度 token。
- Modify: `src/styles/global.css` — 全宽对称 `.site-container`。
- Create: `tests/unit/breadcrumbs.test.ts` — 动态 breadcrumb 规则。
- Modify: `tests/e2e/layout.spec.ts` — Header、边距、Footer、备案和响应式验收。
- Modify: `docs/PROJECT_STATUS.md` — 记录 Task 2、Task 3 和本轮视觉调整的真实完成状态及待补备案资料。

---

### Task 1: 完成 Task 3 品牌布局视觉调整

**Files:**
- Modify: `public/brand/logo.png`
- Create: `src/lib/breadcrumbs.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/layout/Breadcrumbs.astro`
- Modify: `src/components/layout/Footer.astro`
- Modify: `src/components/layout/Header.astro`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Create: `tests/unit/breadcrumbs.test.ts`
- Modify: `tests/e2e/layout.spec.ts`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Produces: `BreadcrumbItem = { label: string; href?: string }`。
- Produces: `resolveFooterBreadcrumbs(items?: readonly BreadcrumbItem[]): BreadcrumbItem[]`。
- `BaseLayout` consumes existing `{ title, description, canonicalPath, image?, breadcrumbs? }` and passes `resolveFooterBreadcrumbs(breadcrumbs)` to `Footer`。
- `Footer` consumes `{ breadcrumbs: readonly BreadcrumbItem[] }`。
- `Breadcrumbs` consumes `{ items: readonly BreadcrumbItem[] }`。

- [ ] **Step 1: 检查 Git 和输入素材**

Run:

```powershell
git status --short --branch
git log -3 --oneline --decorate
git rev-list --left-right --count 'HEAD...@{upstream}'
Test-Path 'C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-44cf34dc-9077-4f53-926a-a5bb2138af36.png'
Test-Path 'D:\Shengborun\.worktrees\site-foundation\public\brand\logo.png'
```

Expected: 工作区为空；`HEAD...@{upstream}` 为 `0 0`；当前 Logo 和华为 Logo 参考图均存在。若参考图已从临时目录消失，停止并请用户重新上传，不使用记忆重建参考图。

- [ ] **Step 2: 写入失败的 breadcrumb 单元测试**

Create `tests/unit/breadcrumbs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveFooterBreadcrumbs } from '../../src/lib/breadcrumbs';

describe('resolveFooterBreadcrumbs', () => {
  it('uses 首页 as the homepage breadcrumb', () => {
    expect(resolveFooterBreadcrumbs()).toEqual([{ label: '首页' }]);
  });

  it('prepends a linked 首页 item for inner pages', () => {
    expect(resolveFooterBreadcrumbs([{ label: '产品中心' }])).toEqual([
      { label: '首页', href: '/' },
      { label: '产品中心' },
    ]);
  });

  it('does not duplicate an existing 首页 item', () => {
    const items = [
      { label: '首页', href: '/' },
      { label: '产品中心' },
    ] as const;

    expect(resolveFooterBreadcrumbs(items)).toEqual(items);
  });
});
```

- [ ] **Step 3: 扩展失败的布局端到端测试**

Update `tests/e2e/layout.spec.ts` with these assertions, keeping all existing navigation, accessibility and SEO checks:

```ts
test('keeps the compact header pinned while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/');

  const header = page.locator('[data-site-header]');
  await expect(header).toHaveCSS('position', 'sticky');
  await expect(header).toHaveCSS('top', '0px');
  expect(Math.round((await header.boundingBox())!.height)).toBe(54);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => Math.round((await header.boundingBox())!.y)).toBe(0);

  await page.setViewportSize({ width: 320, height: 700 });
  expect(Math.round((await header.boundingBox())!.height)).toBe(48);
});

test('uses symmetric capped page gutters', async ({ page }) => {
  for (const width of [1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    for (const selector of ['.header-inner', '.footer-inner']) {
      const container = page.locator(selector);
      const box = (await container.boundingBox())!;
      const { left, right } = await container.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          left: Number.parseFloat(styles.paddingLeft),
          right: Number.parseFloat(styles.paddingRight),
        };
      });

      expect(Math.round(box.width)).toBe(width);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
      expect(left).toBeLessThanOrEqual(121);
      expect(right).toBeLessThanOrEqual(121);
    }
  }
});

test('renders the approved light footer hierarchy', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('.site-footer');
  const breadcrumb = footer.getByRole('navigation', { name: '面包屑' });
  const footerLinks = page.getByRole('navigation', { name: '页脚导航' });

  await expect(breadcrumb).toContainText('首页');
  await expect(footer).toHaveCSS('background-color', 'rgb(245, 245, 247)');
  await expect(footer.locator('summary').first()).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await expect(footerLinks.getByRole('link').first()).toHaveCSS(
    'color',
    'rgb(110, 110, 115)',
  );
  await expect(breadcrumb).toHaveCSS('color', 'rgb(110, 110, 115)');

  const legal = footer.locator('.footer-legal');
  await expect(legal.locator(':scope > *')).toHaveCount(3);
  await expect(legal.locator(':scope > *').nth(0)).toHaveText(
    '版权所有 © 2026 北京盛博润通信设备有限公司。',
  );
  await expect(legal.locator(':scope > *').nth(1)).toHaveText('ICP备案（待确认）');
  await expect(legal.locator(':scope > *').nth(2)).toHaveText(
    '公安联网备案（待确认）',
  );
  await expect(legal.getByRole('link')).toHaveCount(0);
  await expect(footer.locator('input[type="search"]')).toHaveCount(0);
});
```

Extend the existing responsive loop from `[320, 768, 1440]` to `[320, 768, 1440, 1920, 2560]`. Replace the old desktop Logo width expectation with `143–145px`, retain the mobile `119–121px` expectation, and keep the visual-center difference at `≤ 1px`.

- [ ] **Step 4: 运行测试，确认旧实现按预期失败**

Run:

```powershell
pnpm run test:unit -- breadcrumbs.test.ts
pnpm run test:e2e -- layout.spec.ts
```

Expected:

- Unit test FAIL because `src/lib/breadcrumbs.ts` does not exist.
- E2E FAIL because Header is `relative` and 76/68px high, container gutters are capped by a 1200px content width, Footer is dark, breadcrumb is absent, and the legal area has two old text items.
- Existing unrelated assertions continue to run; do not weaken or delete them to obtain a pass.

- [ ] **Step 5: 使用 ImageGen 生成高保真 Logo 候选**

Before generation, inspect both images with `view_image` at original detail:

- Edit target: `D:\Shengborun\.worktrees\site-foundation\public\brand\logo.png`
- Composition reference only: `C:\Users\Lenovo\AppData\Local\Temp\codex-clipboard-44cf34dc-9077-4f53-926a-a5bb2138af36.png`

Call the built-in ImageGen once with both paths in `referenced_image_paths` and this prompt:

```text
Use case: logo-brand
Asset type: high-fidelity website header logo edit
Input images: Image 1 is the exact Shengborun edit target; Image 2 is only a reference for the relative size, spacing, and optical alignment between a symbol and a wordmark.
Primary request: Reproduce Image 1 faithfully as a clean horizontal logo lockup. Preserve the exact SBR symbol silhouette, all three teal nodes, every connector, and the exact Chinese company name “盛博润”. Adjust only the relative size and spacing between the left symbol and right wordmark so it feels balanced like Image 2, with the symbol slightly taller than the text but not dominant.
Style/medium: flat, crisp, vector-like raster logo; no texture.
Composition/framing: one centered horizontal lockup with equal top and bottom whitespace and equal left and right whitespace.
Color palette: all dark portions exactly #1D1D1F; all teal nodes exactly #00B7B5.
Text (verbatim): “盛博润” — exactly these three Chinese characters, rendered once.
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for local removal; no shadows, gradients, texture, lighting variation, reflections, or floor plane.
Constraints: change only scale, spacing, alignment, padding, and the dark color; preserve brand identity and geometry; crisp edges; no extra text; no slogan; no outline; no shadow; no watermark; do not use #FF00FF inside the logo.
Avoid: redesigning SBR; misspelled Chinese; altered node count; added decoration; 3D; mockup presentation.
```

If the first candidate changes the symbol or any Chinese character, discard it and make one targeted retry that repeats the violated invariant. Do not accept more than two generated candidates. If neither candidate preserves the exact brand content, stop and report the blocker rather than shipping an approximate trademark.

- [ ] **Step 6: 透明化、双色归一并建立对称画布**

Copy the accepted generated file to `tmp/imagegen/shengborun-logo-chroma.png`. Run the installed chroma-key helper to create `tmp/imagegen/shengborun-logo-transparent.png`:

```powershell
& 'C:\Users\Lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'C:\Users\Lenovo\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py' --input 'tmp\imagegen\shengborun-logo-chroma.png' --out 'tmp\imagegen\shengborun-logo-transparent.png' --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

Use the bundled Pillow runtime for deterministic finishing:

```python
from pathlib import Path
from PIL import Image

source = Path(r"tmp/imagegen/shengborun-logo-transparent.png")
target = Path(r"public/brand/logo.png")
image = Image.open(source).convert("RGBA")
bbox = image.getchannel("A").getbbox()
if bbox is None:
    raise SystemExit("Logo has no visible pixels")

subject = image.crop(bbox)
target_subject_height = 280
scale = target_subject_height / subject.height
subject = subject.resize(
    (round(subject.width * scale), target_subject_height),
    Image.Resampling.LANCZOS,
)

dark = (0x1D, 0x1D, 0x1F)
teal = (0x00, 0xB7, 0xB5)
pixels = []
for red, green, blue, alpha in subject.getdata():
    dark_distance = sum((value - target_value) ** 2 for value, target_value in zip((red, green, blue), dark))
    teal_distance = sum((value - target_value) ** 2 for value, target_value in zip((red, green, blue), teal))
    color = teal if teal_distance < dark_distance else dark
    pixels.append((*color, alpha))
subject.putdata(pixels)

padding = 28
canvas = Image.new(
    "RGBA",
    (subject.width + padding * 2, subject.height + padding * 2),
    (0, 0, 0, 0),
)
canvas.alpha_composite(subject, (padding, padding))
canvas.save(target, optimize=True)
print(f"saved {target}: {canvas.width}x{canvas.height}")
```

Run this script as a one-off local processing command; do not add it to the repository. The resulting width is derived from the accepted Logo subject ratio, while the 280px subject height plus 28px symmetric padding provides ample resolution for a roughly 34–40px rendered height without forcing an arbitrary canvas width.

- [ ] **Step 7: 视觉验证 Logo，再更新 Header 元数据**

Open the new `public/brand/logo.png` with `view_image` at original detail and compare it with the original source and Huawei ratio reference.

Acceptance checklist:

- “盛博润”三个汉字完全正确。
- SBR 轮廓、三节点和连接线完整。
- 主体左右各 28px、上下各 28px，主体居中。
- 只有 `#1D1D1F`、`#00B7B5` 和透明边缘。
- 图形略高于文字，但公司名不显得过小。
- 在 144px 和 120px 显示宽度下仍清晰。

Read the final PNG width and height with Pillow, then replace `Header.astro` 中 `<img>` 的 `width`、`height` 为返回的两个实际整数。不要保留旧的 `1122` 和 `294`。

- [ ] **Step 8: 实现 breadcrumb 规则和 BaseLayout 数据流**

Create `src/lib/breadcrumbs.ts`:

```ts
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
```

Update `BaseLayout.astro` to import `BreadcrumbItem` and `resolveFooterBreadcrumbs`, remove the breadcrumb render from `<main>`, and pass the resolved items to Footer:

```astro
---
import type { BreadcrumbItem } from '../lib/breadcrumbs';
import { resolveFooterBreadcrumbs } from '../lib/breadcrumbs';

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const { title, description, canonicalPath, image, breadcrumbs = [] } = Astro.props;
const footerBreadcrumbs = resolveFooterBreadcrumbs(breadcrumbs);
---

<main id="main-content">
  <slot />
</main>
<Footer breadcrumbs={footerBreadcrumbs} />
```

Keep `Header`, `SeoHead`, skip-link and document structure unchanged.

- [ ] **Step 9: 实现全宽边距和粘性矮 Header**

Update `tokens.css`:

```css
--page-gutter: clamp(1rem, 6.25vw, 7.5rem);
```

Delete `--content-width: 75rem;` because no remaining component may use it.

Update `.site-container` in `global.css`:

```css
.site-container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--page-gutter);
}
```

Update the relevant `Header.astro` rules:

```css
.site-header {
  position: sticky;
  z-index: 100;
  top: 0;
  background: rgb(255 255 255 / 96%);
  box-shadow: var(--shadow-header);
}

.header-inner {
  display: flex;
  height: 3.375rem;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.brand-mark {
  flex: 0 0 9rem;
}

.brand-mark img {
  width: 9rem;
  height: auto;
}
```

In the mobile media query:

```css
.header-inner {
  height: 3rem;
  gap: 1rem;
}

.brand-mark {
  flex-basis: 7.5rem;
}

.brand-mark img {
  width: 7.5rem;
}

.primary-navigation ul {
  display: grid;
  width: 100%;
  margin-inline: auto;
  gap: 0;
  padding: 0.5rem var(--page-gutter) 1rem;
}
```

Keep the 44px menu button and navigation link interaction heights unchanged.

- [ ] **Step 10: 实现 Footer breadcrumb 和轻灰层级**

Update `Breadcrumbs.astro` to import `BreadcrumbItem`, remove its own `.site-container`, and keep semantic list behavior:

```astro
---
import type { BreadcrumbItem } from '../../lib/breadcrumbs';

interface Props {
  items: readonly BreadcrumbItem[];
}

const { items } = Astro.props;
---

{
  items.length > 0 && (
    <nav class="breadcrumbs" aria-label="面包屑">
      <ol>
        {items.map((item, index) => (
          <li>
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

Use these component styles:

```css
.breadcrumbs {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: var(--text-primary);
}
```

Update `Footer.astro` frontmatter and structure:

```astro
---
import { getCollection } from 'astro:content';
import type { BreadcrumbItem } from '../../lib/breadcrumbs';
import Breadcrumbs from './Breadcrumbs.astro';

interface Props {
  breadcrumbs: readonly BreadcrumbItem[];
}

const { breadcrumbs } = Astro.props;

const [categories, solutions] = await Promise.all([
  getCollection('productCategories', ({ data }) => data.published),
  getCollection('solutions', ({ data }) => data.published),
]);

const sortedCategories = categories.sort(
  (left, right) => left.data.sortOrder - right.data.sortOrder,
);
const sortedSolutions = solutions.sort(
  (left, right) => left.data.sortOrder - right.data.sortOrder,
);

const footerGroups = [
  {
    title: '产品中心',
    links: [
      { label: '全部产品', href: '/products/' },
      ...sortedCategories.map(({ data }) => ({
        label: data.name,
        href: `/products/${data.slug}/`,
      })),
    ],
  },
  {
    title: '解决方案',
    links: [
      { label: '全部解决方案', href: '/solutions/' },
      ...sortedSolutions.slice(0, 6).map(({ data }) => ({
        label: data.name,
        href: `/solutions/${data.slug}/`,
      })),
    ],
  },
  {
    title: '技术支持',
    links: [
      { label: '使用说明', href: '/support#manuals' },
      { label: '常见问题', href: '/support#faq' },
      { label: '全部常见问题', href: '/support/faq/' },
      { label: '售后服务', href: '/support#after-sales' },
    ],
  },
  {
    title: '关于我们',
    links: [
      { label: '公司简介', href: '/about#company' },
      { label: '合规与资质', href: '/about#qualifications' },
      { label: '联系我们', href: '/about#contact' },
    ],
  },
  {
    title: '法律信息',
    links: [
      { label: '隐私政策', href: '/privacy/' },
      { label: '法律声明', href: '/legal/' },
    ],
  },
] as const;
---

<footer class="site-footer">
  <div class="footer-inner site-container">
    <div class="footer-breadcrumb">
      <Breadcrumbs items={breadcrumbs} />
    </div>

    <nav class="footer-navigation" aria-label="页脚导航">
      {
        footerGroups.map((group) => (
          <details class="footer-group" open>
            <summary>{group.title}</summary>
            <ul>
              {group.links.map((link) => (
                <li>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </details>
        ))
      }
    </nav>

    <div class="footer-legal">
      <span>版权所有 © 2026 北京盛博润通信设备有限公司。</span>
      <span class="footer-filing" data-link-pending>ICP备案（待确认）</span>
      <span class="footer-filing" data-link-pending>公安联网备案（待确认）</span>
    </div>
  </div>
</footer>
```

Replace the Footer color and spacing rules with:

```css
.site-footer {
  background: var(--surface-muted);
  color: var(--text-secondary);
}

.footer-inner {
  padding-block: 0;
}

.footer-breadcrumb {
  padding-block: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--divider);
}

.footer-navigation {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-block: 2.75rem 3.5rem;
}

summary {
  color: #000000;
}

a,
.footer-filing {
  color: var(--text-secondary);
}

a:hover {
  color: var(--text-primary);
}

.footer-legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem 2rem;
  padding-block: 1.25rem;
  border-top: 1px solid var(--divider);
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-align: center;
}
```

For mobile, retain the native `<details>` behavior, change `.footer-group` border to `var(--divider)`, reduce `.footer-navigation` padding to `1rem 0 2rem`, and set `.footer-legal { flex-direction: column; gap: 0.5rem; }`. Remove obsolete `.footer-bottom` and `.footer-name` rules.

- [ ] **Step 11: 运行针对性测试并完成最小修正**

Run:

```powershell
pnpm run test:unit -- breadcrumbs.test.ts
pnpm run test:e2e -- layout.spec.ts
```

Expected: breadcrumb 3 tests PASS；布局测试全部 PASS。若失败，只修正与批准规格直接相关的行为，不重构内容集合、SEO 或后续页面。

- [ ] **Step 12: 在本地截图进行视觉复核**

Use Playwright only against `http://127.0.0.1:4321` to capture full-page screenshots at:

- 320 × 900
- 1440 × 900
- 1920 × 1080
- 2560 × 1440

Inspect each screenshot with `view_image` and verify:

- Logo 图文比例与华为参考的相对关系协调，文字和导航处于同一视觉中线。
- Header 高度缩短但 Logo、导航和菜单没有拥挤或裁切。
- 滚动后 Header 始终位于顶部。
- 1920px 和 2560px 下两侧边距不会继续增大，Header 与 Footer 左右边缘对称。
- Footer breadcrumb、横线、五栏导航和法务区的垂直节奏接近参考图。
- Footer 无搜索框、商城行、社交图标或多余底部链接。
- 320px 下 Footer 折叠项和三部分法务文字清晰，无横向溢出。

If a visual defect is found, make one targeted CSS or Logo adjustment and rerun Step 11 plus the affected screenshot width.

- [ ] **Step 13: 更新项目交接状态**

Update `docs/PROJECT_STATUS.md` so it no longer claims only Task 1 is complete. Record:

- Task 1、Task 2、Task 3 及本轮品牌布局视觉调整已经完成。
- 下一阶段为 Task 4“产品中心、参数筛选和产品详情”。
- 当前最新 Logo、Header、Footer 和 breadcrumb 行为。
- ICP 备案和公安联网备案的正式显示文字与 URL 仍待用户提供。
- 当前仍只允许本地开发和测试；正式域名、DNS、HTTPS、服务器和部署限制不变。

- [ ] **Step 14: 完整验证**

Run in order:

```powershell
pnpm run validate:content
pnpm run test:unit
pnpm run check
pnpm run build
pnpm run test:e2e
git diff --check
git status --short
```

Expected:

- Content validation passes.
- All Vitest tests pass.
- Astro check reports 0 errors, 0 warnings and 0 hints.
- Static build succeeds.
- All Playwright tests pass using only `127.0.0.1:4321`.
- `git diff --check` is clean.
- `git status --short` contains only the files listed in this plan; `tmp/imagegen/`, screenshots and rejected Logo candidates are not staged.

- [ ] **Step 15: 提交、推送并停止**

Run:

```powershell
git add -- public/brand/logo.png src/lib/breadcrumbs.ts src/layouts/BaseLayout.astro src/components/layout/Breadcrumbs.astro src/components/layout/Footer.astro src/components/layout/Header.astro src/styles/tokens.css src/styles/global.css tests/unit/breadcrumbs.test.ts tests/e2e/layout.spec.ts docs/PROJECT_STATUS.md
git diff --cached --check
git diff --cached --stat
git commit -m "fix: refine task 3 brand layout"
git push origin codex/site-foundation
git status --short --branch
git rev-list --left-right --count 'HEAD...@{upstream}'
```

Expected: commit and push succeed；final status is clean；ahead/behind is `0 0`。汇报 Logo 的最终像素尺寸、所有修改文件、测试结果和提交哈希，然后停止等待用户确认，不自动开始 Task 4。
