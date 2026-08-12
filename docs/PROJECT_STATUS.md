# 盛博润网站项目状态

最后更新：2026-08-12

## 当前依据

- 现行站点结构：`SiteMap.md`
- 本轮设计规范：`docs/superpowers/specs/2026-08-12-site-structure-and-support-redesign.md`
- 本轮实施计划：`docs/superpowers/plans/2026-08-12-site-structure-and-support-redesign.md`

旧规范和计划属于历史记录；与以上文件冲突时不得作为当前实现依据。

## 已完成基础

- Astro 6 静态工程、TypeScript strict、内容校验、Vitest、Playwright 和 sitemap。
- 全站品牌 tokens、Header、Footer、SEO、面包屑、响应式页面边距和 favicon。
- 产品类别、产品、解决方案及站点设置内容集合。
- 产品卡片与首页产品展示区块。

## 2026-08-12 结构调整

- 首页 `/` 已使用原 `/products/` 的产品展示内容。
- `/products/` 作为临时产品中心页面继续保留；它与首页是两个独立页面文件。
- Header“产品中心”进入 `/two-way-radio/`。
- 四个产品类别使用顶层路径；产品详情使用 `/{category-slug}/{product-slug}/`。
- 产品类别和详情当前只使用 `BaseLayout` 占位，不开发正式功能或正文。
- `/support/` 和六项服务页面均使用 `BaseLayout` 占位；六个服务路径由 `src/data/support-services.ts` 集中维护。
- 旧说明文档和 FAQ 内容集合、校验规则及入口已删除。
- `/solutions/`、方案详情、`/about/`、`/legal/` 和 `/privacy/` 当前建立为占位页。
- Footer 只有产品中心、解决方案、技术支持、关于我们四栏；法律与隐私链接位于底部法律栏。
- Footer 移动端标题文字负责跳转，同行其余区域负责展开或收起。

## 当前路由重点

```text
首页              /
临时产品中心      /products/
产品类别          /{category-slug}/
产品详情          /{category-slug}/{product-slug}/
解决方案          /solutions/
技术支持          /support/
六项服务          /support/{service-slug}/
关于我们          /about/
法律声明          /legal/
隐私政策          /privacy/
```

六个服务 slug：`network-planning`、`system-engineering`、`maintenance-support`、`equipment-inspection`、`communication-support`、`technical-training`。

## 开发和发布边界

- 当前只允许本地开发和测试，不部署、不切换 DNS、不访问正式域名。
- 正式产品资料、服务正文、公司介绍、备案链接和联系方式未确认前，不虚构业务内容。
- 未来重做 `/products/` 默认不影响首页；未来新增首页内容默认不自动同步到 `/products/`。

## Git 状态说明

- 主仓库：`D:\Shengborun`
- 当前工作区：`D:\Shengborun\.worktrees\site-foundation`
- 当前分支：`codex/site-foundation`
- 每阶段遵循测试先行、最小实现、完整验证和独立提交。
