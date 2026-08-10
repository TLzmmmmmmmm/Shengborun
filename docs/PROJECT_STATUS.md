# 盛博润网站项目进度

最后更新：2026-08-10

本文档是跨对话交接的首要状态来源。新对话开始后，应先阅读本文档，再阅读 `SiteMap.md`、品牌配色规范、Task 3 视觉调整规范和完整实施计划。

## 当前结论

- Task 1“静态工程基础与测试框架”已完成。
- Task 2“内容集合、字段校验与示例数据”已完成。
- Task 3“品牌样式、全站布局、顶部导航和页脚”已完成，并已完成 2026-08-10 的 Logo、Header、全站边距、Footer 视觉调整以及 Footer 字号与留白修订。
- 下一阶段是 Task 4“产品中心、参数筛选和产品详情”。未经用户确认不得自动开始。
- 当前只有首页占位页可浏览；产品、解决方案、技术支持、关于我们、隐私和法律页面将在后续 Task 中生成。
- 当前只允许在本地开发和测试，不部署、不切换 DNS、不访问或测试正式域名。
- 本地预览地址：`http://127.0.0.1:4321`，仅在开发服务启动时有效。
- 未来正式域名：`https://www.shengborun.com`。该域名尚未启用，目前只作为本地构建配置、SEO 地址和 sitemap 地址使用。

## Git 状态

- 主仓库：`D:\Shengborun`
- 当前独立工作区：`D:\Shengborun\.worktrees\site-foundation`
- 当前分支：`codex/site-foundation`
- 远程跟踪分支：`origin/codex/site-foundation`
- Task 1 提交：`e87f474 chore: initialize static Astro site`
- 域名更新提交：`4f786f2 chore: update production domain`
- Task 2 提交：`ad6500c feat: define validated website content model`
- Task 3 基础布局提交：`4c2c6c7 feat: add brand layout navigation and footer`
- Logo 尺寸调整提交：`e6fba29 fix: refine header logo sizing`
- Task 3 视觉调整规范：`f76639a`、`e30c19e`、`a4edaa3`
- Task 3 视觉调整计划：`0243b17 docs: plan task 3 layout refinements`
- Footer 与留白修订规范：`41d21ee docs: specify footer and gutter adjustment`
- Footer 与留白修订计划：`b7bafcb docs: plan footer and gutter adjustment`
- Footer 分隔线修订规范：`1a74486 docs: specify footer divider refinement`
- Footer 分隔线修订计划：`fd28990 docs: plan footer divider refinement`

每个阶段开始前必须运行 `git status --short --branch`，确认没有用户未提交修改。每个阶段均按“检查状态 → 测试先行 → 最小实现 → 完整验证 → git add → commit → push → 停下等待确认”的顺序执行。

## 已完成内容

### 1. Astro 静态工程与测试框架

- 使用 Astro 6、TypeScript strict 和 pnpm。
- `output` 为 `static`，构建结果输出到 `dist/`。
- 已接入 `@astrojs/sitemap`、Vitest 和 Playwright。
- Playwright 使用电脑现有 Chrome，只访问本地地址。
- 服务器未来只需托管静态文件，不需要安装 Node.js。

### 2. 内容集合与校验

- 已建立产品类别、产品、解决方案、说明文档、FAQ 和站点设置六个内容集合。
- 已建立 Zod 字段校验、跨集合引用校验、重复 ID 检查和嵌套内容发现。
- `faq` 是技术支持类别保留 slug。
- 产品文档通过稳定产品 ID 关联；不存在 `hasDocuments` 字段。
- 产品标签颜色只允许品牌规范中的六组受控颜色。
- 已加入最小示例内容，正式业务文字和产品资料仍待负责人提供。

### 3. 品牌布局、Header 和 Footer

- 已建立品牌 tokens、全站样式、`BaseLayout`、SEO head、Header、Footer 和 Breadcrumbs。
- Header 只有首页、产品中心、解决方案、技术支持、关于我们五项导航。
- Logo 使用非链接容器，保持“首页”导航作为返回首页入口。
- 新 Logo 文件为 `public/brand/logo.png`，尺寸 `1297 × 336`，透明背景。
- Logo 主体上下各 28px、左右各 28px 对称留白；深色为 `#1D1D1F`，三个节点为 `#00B7B5`。
- Logo 桌面显示宽度 144px，移动端 120px。
- Header 桌面高度 54px，移动端 48px，并使用粘性定位固定在视口顶部。
- 全站容器使用 `clamp(1rem, 7.5vw, 9rem)` 对称边距，超宽屏单侧最多 144px。
- Footer 使用浅灰 `#F5F5F7` 背景、黑色栏目标题、深灰链接和 Footer 专用的 `#DADAE0` 分隔线；全局 `#E8E8ED` 分隔线保持不变。
- Footer 顶部显示动态 breadcrumb：首页为“首页”，未来内页为“首页 / 当前页面”。
- Footer breadcrumb、栏目标题和导航链接字号为 16px；底部版权与备案字号为 14px。
- Footer 保留五栏导航；移动端使用原生 `<details>`。
- Footer 技术支持栏只保留一个“常见问题”入口，地址为 `/support/faq/`。
- Footer 底部是三个左对齐的独立信息单元：版权声明、ICP 备案、公安联网备案。
- Footer 不显示搜索框、商城行、社交图标、电话、邮箱、地址或工作时间。

## 当前待补资料

- 正式公司介绍、产品资料、解决方案资料、支持文档和法律页面文字。
- ICP 备案的正式显示文字和对应跳转地址。
- 公安联网备案的正式显示文字和对应跳转地址。
- 百度统计 ID，留待 Task 7 上线准备时确认。
- 旧网站 URL 清单，留待 Task 8 重定向准备时提供。

备案资料未确认前，Footer 只显示 `ICP备案（待确认）` 和 `公安联网备案（待确认）` 两段非链接文字，不使用 `#` 或猜测地址。收到资料后必须同时更新显示文字、正式 URL 和测试。

## 下一步：Task 4

Task 4 将建立产品查询 helper、产品卡片、功能标签、技术参数、参数筛选、产品列表页、类别页和产品详情页。

必须继续保留以下业务规则：

- 所有已发布产品都显示；是否有说明文档不能控制产品可见性。
- 产品详情 URL 为 `/products/{category-slug}/{product-slug}/`。
- 参数筛选只能从实际存在的参数字段生成，不预设负责人尚未确认的筛选项。
- 不提供应用场景筛选或产品对比。
- 产品与解决方案不建立关联字段。

正式产品资料尚未提供时，只使用现有示例数据完成页面功能和测试，不虚构正式业务内容。

## 重要文件

- `SiteMap.md`：最终确认的站点结构、路由和内容字段。
- `docs/superpowers/specs/2026-08-08-brand-color-design.md`：品牌配色规范。
- `docs/superpowers/specs/2026-08-10-task3-layout-refinement-design.md`：本轮 Task 3 视觉调整规范。
- `docs/superpowers/plans/2026-08-08-shengborun-static-site.md`：完整分阶段计划。
- `docs/superpowers/plans/2026-08-10-task3-layout-refinement.md`：本轮 Task 3 视觉调整实施计划。
- `docs/superpowers/specs/2026-08-10-task3-footer-spacing-adjustment-design.md`：Footer 字号、FAQ、留白和法务区对齐修订规范。
- `docs/superpowers/plans/2026-08-10-task3-footer-spacing-adjustment.md`：Footer 与留白修订实施计划。
- `docs/superpowers/specs/2026-08-10-task3-footer-divider-design.md`：Footer 分隔线颜色修订规范。
- `docs/superpowers/plans/2026-08-10-task3-footer-divider.md`：Footer 分隔线颜色修订实施计划。
- `src/content.config.ts`：内容集合 schema。
- `src/lib/content-rules.ts`：内容业务规则和跨集合校验。
- `src/layouts/BaseLayout.astro`：全站页面框架。
- `src/components/layout/Header.astro`：顶部导航和 Logo。
- `src/components/layout/Footer.astro`：动态 Footer 导航和法务信息。
- `src/lib/breadcrumbs.ts`：Footer breadcrumb 默认规则。
