# Task 3 Mobile Footer Detail Density Design

## Goal

Strengthen the visual hierarchy between mobile Footer section titles and their expanded child links, while making the child-link list 10% more compact vertically.

## Visual Target

- The user-provided mobile Footer screenshot is the visual reference for the expanded state.
- “Detail” means only the child links inside an expanded Footer group, such as `全部产品` and `对讲机通信`.
- Section titles such as `产品中心` and `解决方案` remain visually unchanged.

## Approved Values

- Change mobile child-link font size from `1rem` (`16px`) to `0.875rem` (`14px`).
- Change mobile child-link minimum height from `2.5rem` (`40px`) to `2.25rem` (`36px`), exactly 10% smaller.
- Change the expanded child-list row gap from `0.65rem` (`10.4px`) to `0.585rem` (`9.36px`), exactly 10% smaller.
- Keep the inherited line height, link color, alignment, and interaction behavior unchanged.

## Layout Behavior

- Apply the new font size, minimum height, and row gap only inside the existing mobile breakpoint.
- Do not change `summary` font size, weight, padding, toggle icon, or border styling.
- Do not add compensating blank space below the child links. Because the expanded content becomes shorter, the following section title moves upward naturally.
- Preserve the existing child-list margin and bottom padding.
- Preserve collapsed-group layout and behavior.

## Scope

- Modify only `src/components/layout/Footer.astro` and the existing Footer browser coverage in `tests/e2e/layout.spec.ts`.
- Update `design-qa.md` with the current mobile Footer density evidence after browser verification.
- Use the existing Footer markup and design tokens; add no component, route, dependency, image, icon, or generated asset.
- Preserve desktop Footer typography and spacing, Header behavior, content schemas, page content, and legal information.

## Verification

- Start with browser assertions expecting `14px`, `36px`, and `9.36px` while the implementation still renders the old values.
- Confirm the section-title font size and padding remain unchanged.
- Confirm the Footer groups still open and close with pointer and keyboard interaction.
- Confirm the mobile page has no horizontal overflow.
- Run unit tests, content validation, Astro check, static build, and the full browser suite against the local server.
- Compare the expanded local Footer state with the supplied screenshot and record the result in `design-qa.md`.

## Constraints

- Develop and test only through `http://127.0.0.1:4321`.
- Do not access or test the production domain.
- Do not deploy or modify DNS, HTTPS, or servers.
- Do not start Task 4.
- Keep the favicon 404 recorded as a separate, out-of-scope follow-up.
