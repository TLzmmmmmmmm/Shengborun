# Task 3 Mobile Header Navigation Spacing Refinement Design

## Goal

Increase the mobile primary-navigation row spacing slightly while keeping it visibly tighter than the original layout.

## Approved Value

- Set each mobile navigation link's minimum height to `2.7rem` (`43.2px` at the existing `16px` root font size).
- This is the midpoint between the current `2.4rem` (`38.4px`) and the original `3rem` (`48px`).
- The result is `12.5%` taller than the current implementation and `10%` shorter than the original implementation.

## Scope

- Change only the mobile `.primary-navigation a` minimum height in `Header.astro`.
- Update the existing Playwright expectation for the computed mobile minimum height.
- Preserve the current single-divider implementation: inactive middle rows remain gray, hover and current rows remain teal, and the inactive final row remains transparent.
- Preserve the mobile breakpoint, Header height, Logo size, navigation labels and URLs, accessibility behavior, desktop navigation, Footer, content, and routes.

## Verification

- Start with a failing browser assertion expecting `43.2px` while the implementation still computes to `38.4px`.
- Apply the one-value CSS change and verify the focused browser test passes.
- Run unit tests, content validation, Astro check, static build, and the full browser suite against the local server.
- Confirm there is no horizontal overflow and no change to divider behavior.

## Constraints

- Develop and test only through `http://127.0.0.1:4321`.
- Do not access or test the production domain.
- Do not deploy or modify DNS, HTTPS, or servers.
- Do not start Task 4.
- Keep the existing favicon 404 recorded as a separate, out-of-scope follow-up.
