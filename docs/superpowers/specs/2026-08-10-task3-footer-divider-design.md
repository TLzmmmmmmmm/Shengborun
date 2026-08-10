# Task 3 Footer Divider Refinement Design

## Scope

This revision changes only Footer divider colors. It does not change spacing, typography, navigation, Header styling, content, routes, or deployment configuration.

## Visual Design

- Keep every Footer divider at `1px` solid.
- Use a Footer-specific divider color of `#DADAE0`.
- Apply the color to:
  - the divider between the breadcrumb and Footer navigation;
  - the divider between Footer navigation and the legal row;
  - the dividers between mobile Footer accordion groups.
- Keep the global `--divider: #E8E8ED` token unchanged because it is also used by the mobile Header.
- Keep the Footer background at `#F5F5F7`; `#DADAE0` must remain a restrained contrast rather than a dark rule.

## Implementation Boundary

Define a Footer-scoped `--footer-divider: #DADAE0` custom property on `.site-footer` and replace only the three Footer `var(--divider)` border references with `var(--footer-divider)`. No new component, runtime script, dependency, or public API is required.

## Verification

Browser tests must assert the computed border color `rgb(218, 218, 224)` for the breadcrumb divider, legal-row divider, and a mobile Footer group divider. Existing tests must continue to prove there is no horizontal overflow and that Footer interaction remains usable.

Run the complete local test suite before commit and push. Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.
