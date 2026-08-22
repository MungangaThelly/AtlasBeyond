# Atlas Beyond content contracts

`expedition.schema.json` is the canonical contract for future expedition content. It uses JSON Schema Draft 2020-12 and separates stable gameplay data from localized presentation.

## Trust and migration rules

- Never change an expedition or discovery `id` after release. Saved journals depend on it.
- Keep `legacyStorageKey` while migrating the current browser-based progress model.
- Every evidence card references one or more claim IDs.
- Every claim references one or more declared sources.
- Source licensing must be reviewed before an expedition becomes `available`.
- English, French, and Swedish must have the same discoveries, evidence structure, option count, and correct answer.
- Coordinates are `[longitude, latitude]`. Sensitive places may use an approved representative coordinate, documented in the claim text.
- `reviewed` content requires a reviewer and review timestamp.

Run `npm run check:schema` to validate the schema contract, its fixture, semantic relationships, and every JSON package later added under `content/expeditions/`.
