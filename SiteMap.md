# 盛博润网站现行结构

最后更新：2026-08-12

本文件只描述当前有效的信息架构。历史设计和实施计划若与本文件冲突，以本文件及 `docs/superpowers/specs/2026-08-12-site-structure-and-support-redesign.md` 为准。

## 顶部导航

```text
首页      /
产品中心  /two-way-radio/
解决方案  /solutions/
技术支持  /support/
关于我们  /about/
```

`/products/` 继续保留为临时占位产品中心页面，但不作为顶部或页脚入口。

## 页面与路由

```text
首页  /
临时产品中心  /products/

产品类别  /{category-slug}/
└─ 产品详情  /{category-slug}/{product-slug}/

解决方案  /solutions/
└─ 方案详情  /solutions/{solution-slug}/

技术支持  /support/
├─ 网络规划服务  /support/network-planning/
├─ 系统工程建设服务  /support/system-engineering/
├─ 维护保障服务  /support/maintenance-support/
├─ 设备巡检服务  /support/equipment-inspection/
├─ 通讯保障服务  /support/communication-support/
└─ 技术培训服务  /support/technical-training/

关于我们  /about/
├─ 公司简介  /about/#company
├─ 合规与资质  /about/#qualifications
└─ 联系我们  /about/#contact

法律声明  /legal/
隐私政策  /privacy/
```

四个产品类别为 `/two-way-radio/`、`/shortwave-radio/`、`/mesh-network/`、`/ict-integration/`。不得建立带 `/products/` 前缀的类别或详情路由。

## 当前页面状态

- `/` 与 `/products/` 当前显示相同的产品展示内容，但由两个独立页面文件组合，可以在未来分别修改。
- 产品类别、产品详情、解决方案、方案详情、技术支持、六项服务、关于我们、法律声明和隐私政策当前均使用默认 `BaseLayout` 占位。
- 本轮不开发产品类别功能、产品详情正文、support 卡片或服务详情正文。
- 旧支持说明文档、FAQ 和售后服务架构已取消，不保留内容模型或入口。

## 页脚

页脚主导航只有四栏：

- 产品中心：标题不可点击，明细为四个产品类别；
- 解决方案：标题链接 `/solutions/`，明细为全部已发布具体方案；
- 技术支持：标题链接 `/support/`，明细为六项服务；
- 关于我们：标题链接 `/about/`，明细为三个正文锚点。

移动端每栏标题占一行：点击可链接的标题文字只跳转；点击该行除文字外的区域只展开或收起。产品中心文字为静态标题。

法律声明和隐私政策不属于主导航，和版权、ICP 备案、公安联网备案并列在底部法律栏。桌面端使用 `space-between`；移动端版权独占第一行，其余四项在居中的第二信息组。

## 保持原则

- 全站只提供简体中文公开内容，不包含登录、支付或信息提交功能。
- 所有公开页面使用静态生成，服务器只托管构建产物。
- 正式业务资料未确认前，不编造公司承诺、联系方式、备案链接或产品数据。
