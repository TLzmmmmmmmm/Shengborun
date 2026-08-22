# 北京盛博润通信设备有限公司官网

这是一个使用 **Astro** 和 **TypeScript** 构建的生产级企业官网，包含内容驱动的产品目录，覆盖 **4 个产品分类中的 49 款产品**，以及 **6 个行业解决方案页面**。

本项目由我独立完成从设计到开发的全流程工作，涵盖信息架构、响应式 UI、内容建模、SEO、内容校验、自动化测试和生产部署。

[访问盛博润线上网站](https://www.shengborun.com/) · [English README](./README.md)

## 项目概览

| | |
| --- | --- |
| **个人角色** | 独立设计与开发 |
| **工作范围** | UX/UI、前端架构、内容建模、测试、SEO、部署 |
| **技术栈** | Astro、TypeScript、Content Collections、Zod、Vitest、Playwright |
| **内容规模** | 49 款产品、4 个产品分类、6 个行业解决方案 |
| **生产环境** | 静态生成、Ubuntu、Nginx、HTTPS |

## 项目挑战

网站需要承载层级清晰的专业通信产品目录和长篇行业解决方案内容，同时保持易于维护、响应迅速且导航清晰。

核心工程挑战是建立一套无需逐页维护的系统，使业务内容、复用 UI 组件、生成式路由、内容校验和部署流程能够各自演进。

## 核心成果

- 使用复用 Astro 组件和共享设计变量构建响应式企业 UI 系统。
- 使用 Astro Content Collections 和 Zod Schema 管理覆盖 4 个分类的 49 款产品。
- 静态生成产品详情、产品分类和行业解决方案页面。
- 在构建阶段校验内容关系、ID、slug 和产品特性引用。
- 建立 SEO 与可访问性基础，包括 canonical URL、Open Graph 元数据、sitemap、语义化 HTML 和跳转主内容链接。
- 建立经过测试的生产工作流，通过 Nginx 和 HTTPS 部署生成的静态网站。

## 关键工程决策

### 1. 静态生成符合产品需求

网站以内容展示为主，不需要身份验证、在线交易或服务端应用逻辑。

静态生成减少了运行时复杂度、服务器资源需求和运维成本，同时保证页面交付快速且可预测。

### 2. 内容是数据，而不是页面标记

产品和分类以结构化 JSON 存储，长篇行业解决方案使用 Markdown。Astro Content Collections 通过明确的 Schema 加载这些内容，使业务数据与展示逻辑保持分离。

共享工具会过滤和转换已发布内容，再由 Astro 在构建阶段生成对应路由。

因此，新增产品主要是一项内容维护工作，而不是重复开发页面。

### 3. 无效内容在部署前阻止构建

构建流程既校验单个内容文档，也检查不同内容集合之间的关系。

重复 ID、无效分类引用、不符合规则的 slug 和未定义的产品特性引用都会在成为错误的生产页面前被发现。

### 4. 组件遵循稳定的内容边界

复用组件对应产品卡片、产品主视觉、技术参数、面包屑、导航和解决方案内容等稳定的展示概念。

页面文件负责路由和组合，共享展示行为则封装在复用组件中。

## 技术栈

| 领域 | 技术 |
| --- | --- |
| 框架 | Astro 6 |
| 语言 | TypeScript、Astro strict mode |
| 内容系统 | Astro Content Collections、JSON、Markdown、Zod |
| UI | Astro 组件、Scoped CSS、Lucide 图标 |
| 单元测试 | Vitest |
| 端到端测试 | Playwright、Chromium |
| 包管理 | pnpm |
| 部署 | 在 Ubuntu 上生成静态网站，通过 Nginx 和 HTTPS 提供服务 |

## 质量保障

项目采用多层验证机制：

- **内容校验**检查 Schema、ID、分类关系、slug 和产品特性引用。
- **Vitest** 覆盖内容 Schema、路由和展示工具、面包屑及站点配置。
- **Playwright** 覆盖导航、响应式布局、生成式路由、产品详情行为、元数据、面包屑和浏览器行为。
- **Astro 检查**在生产构建前提供框架和类型诊断。

可以通过以下命令运行完整验证流程：

```bash
pnpm test
```

该命令会依次运行单元测试、校验并构建生产网站，最后执行浏览器级测试套件。

## 生产部署

网站被生成并部署为静态 HTML、CSS 和资源文件，运行于启用 HTTPS 的 Ubuntu 与 Nginx 环境。

发布流程包括生产校验、静态产物部署、Nginx 配置检查，以及必要时回滚至上一个已部署版本。

## 本地运行

环境要求：

- Astro 6 支持的 Node.js 版本
- pnpm
- Google Chrome，用于运行当前配置的 Playwright 项目

```bash
git clone https://github.com/TLzmmmmmmmm/Shengborun.git
cd Shengborun

pnpm install
pnpm dev
```

Astro 默认在 `http://localhost:4321` 启动开发服务器。

### 常用命令

```bash
pnpm dev                  # 启动开发服务器
pnpm run check            # 执行 Astro 检查
pnpm run validate:content # 校验内容引用
pnpm run test:unit        # 执行 Vitest
pnpm run build            # 校验并生成生产构建
pnpm run test:e2e         # 执行 Playwright
pnpm test                 # 执行完整验证流程
```

## 内容与使用说明

本仓库作为个人工程作品集公开展示。

项目中的公司名称、商标、产品资料和视觉素材，其权利归相应权利人所有。本仓库不授予对公司专有内容或第三方素材的再使用许可。
