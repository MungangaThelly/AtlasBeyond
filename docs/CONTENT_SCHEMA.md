# Atlas Beyond Content Schema

`catalog.js` is the first executable version of the regional content catalog.
New regions should be added as data rather than hard-coded interface markup.

Each expedition has a stable ID, release status, region, duration, discovery
count, interest tags, and localized presentation. Each optional discovery has a
stable ID, coordinates, interest category, authoritative source, and localized
type, title, and summary.

## Rules

- IDs never change after player progress is released.
- Coordinates use `[longitude, latitude]`.
- Every factual discovery requires an authoritative source URL.
- Localized text preserves local place names.
- Optional discoveries never block the main expedition.
- Sensitive sites can omit or blur coordinates.
- New catalog versions require validation before release.

The formal Draft 2020-12 contract now lives at
`content/schema/expedition.schema.json`. It defines stable IDs, localization,
evidence-to-claim relationships, source licensing, uncertainty, knowledge
rewards, and editorial review status. `npm run check:schema` validates both the
structural contract and semantic relationships that JSON Schema cannot express
alone. The four released expeditions now also exist as review-stage packages in
`content/expeditions/`. `npm run check:migration` proves parity with the live
prototype, including expedition identity, browser progress keys, coordinates,
localized options, and correct deductions. The runtime remains on its existing
JavaScript data until the packages complete licensing and editorial review.

`region-player.html` and `region-player.js` now demonstrate a reusable runtime:
an expedition data object supplies its map center, localized discoveries,
evidence, deductions, coordinates, and sources without region-specific markup.
