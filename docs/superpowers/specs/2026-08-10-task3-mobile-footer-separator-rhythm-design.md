# Task 3 Mobile Footer Separator And Rhythm Correction Design

## Scope

This correction supersedes the visual effect of commit `4c79a4e` without rewriting pushed Git history. It changes only the mobile relationship between the final Footer navigation group and the legal row. Desktop Footer styling and all other site behavior remain unchanged.

## Git Strategy

- Keep commit `4c79a4e` in history.
- Create a new corrective implementation commit.
- Do not use `git reset`, history rewriting, or force-push.

## Mobile Visual Design

At viewport widths below `48rem`:

- Restore the final `法律信息` group bottom border by removing the `.footer-group:last-child { border-bottom: 0; }` override.
- Keep every Footer navigation-group bottom border at `1px solid #DADAE0`.
- Remove `.footer-legal`'s top border so only the final navigation-group border separates navigation from copyright.
- Change `.footer-navigation` from `padding-block: 1rem 2rem` to `padding-block: 1rem 0` to remove the extra 2rem gap below navigation.
- Set `.footer-legal` top padding to `1rem`; keep its existing bottom padding at `1.25rem`.
- The visual step from the `法律信息` title to the copyright text should match the step between adjacent collapsed Footer titles within a small pixel tolerance.

At viewport widths of `48rem` and above:

- Keep the final group without a group border, as in the existing desktop layout.
- Keep `.footer-legal`'s `1px solid #DADAE0` top border and existing padding.

## Implementation Boundary

Modify only the mobile rules in `Footer.astro`; do not change markup, JavaScript, text, colors, typography, navigation links, or component interfaces.

## Verification

Browser tests must verify:

- At `320px`, the final Footer group has a `1px` bottom border with color `rgb(218, 218, 224)` and the legal row has `0px` top-border width.
- At `767px`, the center-to-center distance from the final two Footer titles is within `2px` of the center-to-center distance from `法律信息` to the first copyright item.
- At `768px`, the legal row still has a `1px` top border with color `rgb(218, 218, 224)`.
- Existing accordion interaction and horizontal-overflow checks continue to pass.

Run the complete local test suite before commit and push. Do not deploy, access or test the production domain, or change DNS, HTTPS, or servers.
