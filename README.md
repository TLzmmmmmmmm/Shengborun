# Shengborun Communications Website

A production corporate website built with **Astro** and **TypeScript**, featuring a content-driven catalog of **49 products across 4 categories** and **6 industry solution pages**.

I independently designed and developed the project end to end, covering information architecture, responsive UI, content modeling, SEO, validation, testing, and production deployment.

[Shengborun Live Website](https://www.shengborun.com/) · [中文说明](./README.zh-CN.md)

## Project at a Glance

| | |
| --- | --- |
| **Role** | Independent Designer & Developer |
| **Scope** | UX/UI, frontend architecture, content modeling, testing, SEO, deployment |
| **Stack** | Astro, TypeScript, Content Collections, Zod, Vitest, Playwright |
| **Content** | 49 products, 4 product categories, 6 industry solutions |
| **Production** | Static generation, Ubuntu, Nginx, HTTPS |

## The Challenge

The website needed to support a multi-level communications product catalog and long-form industry solutions while remaining maintainable, responsive, and easy to navigate.

The core engineering challenge was designing a system where business content, reusable UI components, generated routes, validation, and deployment could evolve without requiring page-by-page maintenance.

## What I Built

- A responsive corporate UI system using reusable Astro components and shared design tokens.
- A structured catalog of 49 products across 4 categories using Astro Content Collections and Zod schemas.
- Statically generated product, category, and industry-solution pages.
- Build-time validation for content relationships, IDs, slugs, and feature references.
- SEO and accessibility foundations including canonical URLs, Open Graph metadata, sitemap generation, semantic HTML, and skip navigation.
- A tested production workflow for deploying the generated static site through Nginx over HTTPS.

## Engineering Decisions

### 1. Static generation fits the product requirements

The site is primarily content-driven and does not require authentication, transactions, or server-side application logic.

Using static generation reduces runtime complexity, server resource requirements, and operational overhead while keeping page delivery fast and predictable.

### 2. Content is data, not page markup

Products and categories are stored as structured JSON, while long-form industry solutions use Markdown. Astro Content Collections load this content through explicit schemas and keep business data separate from presentation logic.

Published content is then filtered and transformed through shared utilities before Astro generates the corresponding routes at build time.

Adding a new product is therefore primarily a content operation rather than a page-development task.

### 3. Invalid content fails before deployment

The build pipeline validates both individual documents and relationships across collections.

It catches issues such as duplicate IDs, invalid category references, malformed slugs, and undefined feature references before they can become broken production pages.

### 4. Components follow stable content boundaries

Reusable components represent stable presentation concepts such as product cards, product heroes, technical parameters, breadcrumbs, navigation, and solution content.

Page files handle routing and composition, while shared presentation behavior remains isolated in reusable components.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Astro 6 |
| Language | TypeScript with Astro strict mode |
| Content | Astro Content Collections, JSON, Markdown, Zod |
| UI | Astro components, scoped CSS, Lucide icons |
| Unit testing | Vitest |
| End-to-end testing | Playwright with Chromium |
| Package management | pnpm |
| Deployment | Static build on Ubuntu, served by Nginx over HTTPS |

## Quality Assurance

The project uses several layers of verification:

- **Content validation** checks schemas, IDs, category relationships, slugs, and feature references.
- **Vitest** covers content schemas, routing and presentation utilities, breadcrumbs, and configuration.
- **Playwright** covers navigation, responsive layouts, generated routes, product-detail behavior, metadata, breadcrumbs, and browser behavior.
- **Astro checks** provide framework and type diagnostics before production builds.

The complete verification pipeline can be run with:

```bash
pnpm test
```

This runs unit tests, validates and builds the production site, and then runs the browser-level test suite.

## Production

The site is generated as static HTML, CSS, and assets and deployed to an Ubuntu server behind Nginx with HTTPS enabled.

The release workflow includes production validation, static artifact deployment, Nginx configuration checks, and rollback to the previous deployed build when necessary.

## Run Locally

Requirements:

- Node.js version supported by Astro 6
- pnpm
- Google Chrome for the configured Playwright project

```bash
git clone https://github.com/TLzmmmmmmmm/Shengborun.git
cd Shengborun

pnpm install
pnpm dev
```

Astro serves the development site at `http://localhost:4321` by default.

### Commands

```bash
pnpm dev                  # Start the development server
pnpm run check            # Run Astro diagnostics
pnpm run validate:content # Validate content references
pnpm run test:unit        # Run Vitest
pnpm run build            # Validate and generate the production build
pnpm run test:e2e         # Run Playwright
pnpm test                 # Run the full verification pipeline
```

## Content and Usage Notice

This repository is published as a personal engineering portfolio project.

Company names, trademarks, product information, and visual assets remain the property of their respective owners. No license is granted for reuse of proprietary company content or third-party assets.