# Product Card and Navigation Responsive Fixes Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Fix responsive navigation sizing, product-card text preservation, CTA proportions, mobile breadcrumb typography, and footer accordion visibility.

**Architecture:** Keep the current Astro component boundaries. Add browser regression assertions first, then make scoped CSS changes in CategoryNavigation, ProductCard, Breadcrumbs, and Footer without changing routes or content data.

## Tasks

- [x] Add failing tests for fluid desktop icons at 1024/1440/1920, visible desktop features, one-third desktop CTA, equal mobile CTA/feature font sizes, middle-dot separators, 14px mobile breadcrumbs, and footer panel visibility.
- [x] Verify the new tests fail against the current production build.
- [x] Implement fluid `clamp()` navigation sizing and proportional glyph sizing.
- [x] Rebalance desktop ProductCard spacing so features remain visible, set desktop CTA width to one third, and align mobile CTA typography and feature separators.
- [x] Set mobile Breadcrumbs to 14px and restore footer `[hidden]` behavior.
- [x] Build, run focused browser tests, capture screenshots, and complete full regression verification.
