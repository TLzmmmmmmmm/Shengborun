# Task 3 Mobile Header Navigation Divider Design

## Goal

Correct the mobile Header navigation so the active indicator and the normal row divider are the same physical line, while reducing the vertical space between navigation titles by 20%.

This is a focused Task 3 visual correction. It does not create routes, change navigation labels, or start Task 4.

## Current Problem

At mobile widths, every navigation link uses a gray `border-bottom`, while the active link also draws a separate teal `::after` indicator above that border. The two lines occupy different vertical positions, producing the visible mismatch shown in the user-provided mobile screenshot.

The final “关于我们” link currently removes its border unconditionally. That rule cannot represent all required states because the final link must have no visible line when inactive, but must show the same teal line when hovered or current.

## Approved Visual Behavior

At viewport widths below `48rem`:

- Reduce each navigation link's minimum height from `3rem` to `2.4rem`, an exact 20% reduction.
- Keep the existing text size, weight, color, horizontal alignment, list padding, and navigation width.
- Disable the decorative `::after` indicator for mobile navigation links.
- Use each link's real `1px` bottom border as the only state line.
- Give ordinary inactive rows the existing divider color, `var(--divider)`.
- Change that same border to `var(--brand-teal)` on hover.
- Keep that same border `var(--brand-teal)` when the link has `aria-current="page"`.
- Give the final “关于我们” row a transparent border when it is neither hovered nor current. The transparent `1px` border preserves layout height while displaying no trailing line.
- Allow the final row's transparent border to become teal on hover or when current.

The teal state must not add a second line, alter border thickness, or shift the link vertically.

At viewport widths of `48rem` and above, preserve the existing desktop navigation indicator, spacing, and behavior unchanged.

## Interaction And Accessibility

- Keep the current `aria-current="page"` route logic unchanged.
- Keep the existing menu toggle, Escape-key close behavior, link activation, focus behavior, and responsive breakpoint unchanged.
- Hover is an enhancement for pointer users; the current-page state remains visible without hover.
- Do not encode the state using color alone in markup: `aria-current="page"` remains the semantic current-page indicator.

## Implementation Boundary

Modify only the mobile navigation styles in `src/components/layout/Header.astro` and the relevant browser regression coverage in `tests/e2e/layout.spec.ts`.

Do not change component markup, JavaScript, navigation data, global tokens, Header height, Logo size, desktop styles, Footer, content schemas, routes, or page content.

No new image or icon assets are needed because the reference contains only existing text and divider styling.

## Verification

Use browser tests at a `320px` viewport to verify:

- the opened mobile navigation remains usable;
- each navigation link has a computed minimum height of `38.4px` (`2.4rem` at the existing root font size);
- the current “首页” link uses a `1px` teal bottom border;
- a normal inactive link uses a `1px` gray bottom border;
- the mobile `::after` indicator is not displayed;
- hovering a normal inactive link changes its existing border to teal without changing its width;
- the inactive final “关于我们” link has a transparent `1px` border;
- hovering the final link changes that border to teal;
- applying the current-page state to the final link displays the same teal `1px` border;
- no horizontal overflow is introduced.

Run the complete local unit, content, Astro, build, and end-to-end verification suite. Capture the opened mobile navigation at the same `320px` width and compare it with the supplied reference screenshot; design QA must confirm the duplicate line is gone and the reduced vertical rhythm matches the approved direction.

All work and verification remain local at `http://127.0.0.1:4321`. Do not deploy, access or test the production domain, or modify DNS, HTTPS, or servers.
