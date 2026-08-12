# Task 3 Footer And Gutter Adjustment Design

## Scope

This revision changes only the shared Footer typography and alignment, the technical-support Footer links, and the global horizontal page gutter. It does not add pages, deploy the site, or access the future production domain.

## Footer Typography

- Breadcrumb text: `16px` (`1rem`).
- Footer group headings: `16px` (`1rem`) with the existing bold weight.
- Footer navigation links: `16px` (`1rem`).
- Copyright and filing text: `14px` (`0.875rem`).
- Existing colors, spacing hierarchy, hover behavior, and mobile accordion behavior remain unchanged unless required to prevent overflow.

## Technical Support Links

The technical-support group contains exactly these three links:

1. `使用说明` → `/support#manuals`
2. `常见问题` → `/support/faq/`
3. `售后服务` → `/support#after-sales`

The previous `/support#faq` link and the `全部常见问题` label are removed, so only one FAQ link remains.

## Global Horizontal Gutter

Increase both parts of the current responsive gutter by 20%:

- Fluid value: `6.25vw` → `7.5vw`.
- Maximum per-side gutter: `7.5rem` (`120px`) → `9rem` (`144px`).
- Minimum mobile gutter remains `1rem` (`16px`) to preserve usable space at narrow widths.
- The gutter remains symmetric and shared by Header, main content, and Footer through `.site-container`.

## Footer Legal Alignment

- The three legal items remain separate elements.
- The legal row is left-aligned instead of centered.
- Desktop keeps the existing wrapped horizontal layout and inter-item spacing.
- Mobile stacks the three items vertically and keeps both the container and text left-aligned.
- `ICP备案（待确认）` and `公安联网备案（待确认）` remain plain text until the confirmed labels and URLs are supplied.
- Preserve the existing uncommitted wording `版权所有 © 2026 北京盛博润通信设备有限公司` without restoring the removed final punctuation.

## Verification

Browser tests must prove that:

- Footer typography uses the approved `16px` and `14px` sizes.
- Exactly one `常见问题` link exists in the Footer and its `href` is `/support/faq/`.
- Desktop page gutters are symmetric and do not exceed `145px` after pixel rounding.
- The legal row and its text are left-aligned on desktop and mobile.
- No horizontal overflow appears at the existing tested viewport widths.

Run the complete project test suite before commit and push. Work remains local-only; no deployment, production-domain access, DNS, HTTPS, or server changes are permitted.
