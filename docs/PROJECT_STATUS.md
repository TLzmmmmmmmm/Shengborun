# 盛博润网站项目进度

最后更新：2026-08-09

本文档是跨对话交接的首要状态来源。新对话开始后，应先阅读本文档，再阅读 `SiteMap.md`、品牌配色规范和完整实施计划。不要仅根据实施计划中的历史复选框判断已完成进度。

## 当前结论

- 当前阶段：Task 1“静态工程基础与测试框架”已经完成。
- 下一阶段：Task 2“内容集合、字段校验与示例数据”，尚未开始。
- 当前只允许在本地开发和测试，不部署、不切换 DNS、不访问或测试正式域名。
- 本地预览地址：`http://127.0.0.1:4321`，仅在开发服务启动时有效。
- 未来正式域名：`https://www.shengborun.com`。该域名刚购买、尚未启用；目前只作为本地构建配置、SEO 地址和 sitemap 地址使用。
- 旧域名 `www.bjlmks.com.cn` 已从当前代码、测试、计划和本地构建产物中移除。

## Git 状态

- 主仓库：`D:\Shengborun`
- 当前独立工作区：`D:\Shengborun\.worktrees\site-foundation`
- 当前分支：`codex/site-foundation`
- 远程跟踪分支：`origin/codex/site-foundation`
- Task 1 提交：`e87f474 chore: initialize static Astro site`
- 域名更新提交：`4f786f2 chore: update production domain`
- `main` 上的工作区忽略提交：`bbbfa32 chore: ignore local worktrees`

开始下一步前必须先运行 `git status --short --branch`，确认没有用户未提交的修改。每个阶段均按“检查状态 → 测试先行 → 最小实现 → 验证 → git add → commit → push → 停下等待确认”的顺序执行。

## 已完成内容

### 1. Astro 静态工程

- 使用 Astro 6 和 TypeScript strict。
- `output` 为 `static`，构建结果输出到 `dist/`。
- URL 构建格式为目录形式。
- 已接入 `@astrojs/sitemap`。
- 已建立 pnpm 锁文件和依赖安装配置。
- 服务器未来只需托管构建后的 HTML、CSS、JavaScript、图片和 PDF，不需要在服务器安装 Node.js。

### 2. 最小本地页面

- 已建立临时首页 `src/pages/index.astro`。
- 当前只包含简体中文 HTML 基础结构、临时描述和“盛博润”标题。
- 该页面仅用于验证工程，不是最终首页设计。

### 3. 测试与检查

- Vitest 单元测试验证正式域名配置为 `https://www.shengborun.com`。
- Playwright 本地烟雾测试验证首页返回 200、标题正确、一级标题可见。
- Playwright 配置使用电脑现有的 Chrome，只测试本地地址。
- 已验证 `pnpm run test:unit` 通过。
- 已验证 `pnpm run build` 通过，其中 Astro 检查为 0 错误、0 警告。
- 本地构建已生成 `dist/index.html`、`dist/sitemap-index.xml` 和 `dist/sitemap-0.xml`。
- sitemap 中的未来正式地址为 `https://www.shengborun.com/`；这不代表域名已经上线或经过联网验证。

## 尚未开始

- Astro Content Collections 和内容字段校验。
- 产品类别、产品、解决方案、说明文档、FAQ 和全站设置的示例内容。
- 正式首页、顶部导航、页脚、响应式布局和品牌样式。
- 产品中心、参数筛选和产品详情页。
- 解决方案列表和详情页。
- 技术支持、使用说明、FAQ 和售后区块。
- 关于我们、隐私政策、法律声明、SEO helpers 和百度统计。
- Logo 正式网站资源整理与接入。
- 旧网站 URL 对照、IIS 重定向、HTTPS、FTP 部署和回滚流程。
- 对新域名的 DNS、证书和线上访问测试。

## 已确认的网站约束

- 网站只提供简体中文公开内容。
- 不实现访客登录、支付或信息提交。
- 顶部导航为：首页、产品中心、解决方案、技术支持、关于我们。
- Logo 不链接首页；“首页”导航链接负责返回首页。
- 顶部不设置固定电话咨询按钮。
- 联系方式只在 `/about#contact` 显示，页脚不直接显示电话、邮箱、地址或工作时间。
- 产品始终显示在产品中心和独立详情页；是否存在说明文档不影响产品展示。
- 产品与解决方案不建立关联字段。
- 产品参数筛选项等待产品负责人确认，暂不预设具体参数。
- 不提供应用场景筛选和产品对比功能。
- 每份说明文档同时提供网页正文和 PDF 下载。
- `/support` 展示前三个常见问题，只有“查看更多”按钮跳转到 `/support/faq`。
- 网站背景以黑、白、灰为主，Logo 青绿色 `#00B7B5` 主要用于按钮和少量强调。

完整路由和字段规则以仓库根目录的 `SiteMap.md` 为准，完整颜色规则以 `docs/superpowers/specs/2026-08-08-brand-color-design.md` 为准。

## 下一步：Task 2

下一步应严格执行完整实施计划中的 Task 2，只建立内容集合、字段校验和最小示例数据，不提前制作正式页面或视觉布局。

预计新增：

- `src/content.config.ts`
- `src/lib/content-rules.ts`
- 产品类别、产品、解决方案、说明文档、FAQ 和站点设置的最小示例内容
- `scripts/validate-content.mjs`
- `tests/unit/content-schema.test.ts`

Task 2 必须保留的业务规则：

- `faq` 是技术支持类别的保留 slug。
- 产品关键功能标签只能使用品牌规范中的六种受控颜色。
- 产品文档通过稳定的产品 `id` 关联。
- 不建立 `hasDocuments` 字段。
- 产品是否有文档不能控制产品是否公开显示。
- 产品参数筛选字段暂不直接确定，等待产品负责人提供资料。

开始 Task 2 前先向用户汇报计划并等待确认；不得因为读取本文档而自动开始执行。

## 重要文件

- `SiteMap.md`：最终确认的站点结构、路由和内容字段。
- `docs/superpowers/specs/2026-08-08-brand-color-design.md`：最终确认的品牌配色规范。
- `docs/superpowers/plans/2026-08-08-shengborun-static-site.md`：完整的分阶段实施计划。
- `astro.config.mjs`：静态输出、未来正式域名和 sitemap 配置。
- `src/config/site.ts`：统一的未来正式站点地址。
- `package.json`：本地开发、测试、检查和构建命令。
