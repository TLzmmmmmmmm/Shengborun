# Product Short Description Removal Design

## Goal

Remove `shortDescription` from the product content entity because products no longer need a brief introduction. This is a content-contract correction after Task 2 and does not start Task 4 page implementation.

## Scope

- Remove `shortDescription` from the product schema.
- Remove the field from existing product sample content.
- Keep the separate optional `shortDescription` field on product-category entities unchanged.
- Update product model documentation and the static-site implementation plan so they no longer instruct authors or future page work to use a product summary.
- Add regression coverage proving that the removed product field is rejected by the strict schema.

## Product Presentation Contract

Future product cards and search results will not show a brief product introduction. They may show established non-summary information such as the product name, cover image, category, and feature tags.

Product detail pages may still use `productFeatures` for complete product-feature text. `productFeatures` will not be shortened or repurposed as a replacement card summary.

The optional category `shortDescription` remains valid because it describes a product category rather than an individual product.

## Data Migration And Validation

The current sample product frontmatter will have its `shortDescription` entry removed. No replacement text field will be introduced.

The product schema remains strict. After the migration, a product containing the legacy `shortDescription` key must fail validation as an unknown field. Existing validation rules, relationships, and all other product fields remain unchanged.

## Documentation Updates

- Remove the product `shortDescription` row and the explanation contrasting it with `productFeatures` from `SiteMap.md`.
- Update the original static-site plan's product schema example.
- Update future product-card guidance so it does not depend on or display a brief description.
- Record the completed model correction in the project handoff status.

## Verification

Follow test-driven development:

1. First change the focused schema tests so valid products omit `shortDescription`, and add a regression test requiring the legacy field to be rejected.
2. Confirm the new regression test fails against the old schema.
3. Apply the minimal schema, sample-content, and documentation changes.
4. Run the focused unit tests, complete unit suite, content validation, Astro checks, production build, and local end-to-end suite.

All verification stays local. Do not deploy, access or test the production domain, or modify DNS, HTTPS, or servers.
