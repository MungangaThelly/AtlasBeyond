# Migrated expedition packages

These JSON files are the canonical, reviewable successors to the prototype JavaScript content. `npm run build:content` creates the browser bundle consumed through `canonical-adapter.js`. The adapter preserves released progress keys and keeps the specialized Iceland interaction compatible while regional players consume canonical discoveries directly.

All packages currently have `status: review`. Source licensing, claim review, and translation review must be completed before they can become `available` in the canonical pipeline.

Regenerate the packages from the current runtime with `npm run migrate:content`, then run `npm run check`. Released `id` and `legacyStorageKey` values must never change.
