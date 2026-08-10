# Task 3 Mobile Footer Last Divider Design

## Scope

This revision removes one redundant divider from the mobile Footer only. It does not change desktop Footer styling, other mobile accordion dividers, spacing, typography, content, navigation, or component behavior.

## Visual Design

- At viewport widths below `48rem`, remove the bottom border from the final Footer navigation group, `法律信息`.
- Keep the bottom borders between all earlier mobile Footer navigation groups.
- Keep `.footer-legal`'s `1px solid #DADAE0` top border as the sole separator between the navigation area and the copyright/filing area.
- Keep all desktop Footer dividers unchanged.

## Implementation Boundary

Add a mobile-only `.footer-group:last-child { border-bottom: 0; }` rule after the existing mobile `.footer-group` border declaration. Do not change markup, JavaScript, the `--footer-divider` value, or the legal-row border.

## Verification

The mobile browser test at `320px` must assert:

- the first Footer group retains `border-bottom-color: rgb(218, 218, 224)` and a `1px` border width;
- the final Footer group has `border-bottom-width: 0px`;
- the legal row retains `border-top-color: rgb(218, 218, 224)` and a `1px` border width;
- existing accordion interaction and horizontal-overflow checks still pass.

Run the complete local test suite before commit and push. Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.
