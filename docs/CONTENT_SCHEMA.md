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

The next production step is to move this JavaScript object into validated JSON
or a content API with a formal JSON Schema and editorial review status.

`region-player.html` and `region-player.js` now demonstrate a reusable runtime:
an expedition data object supplies its map center, localized discoveries,
evidence, deductions, coordinates, and sources without region-specific markup.
