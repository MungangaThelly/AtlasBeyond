# Migrated expedition packages

These JSON files are the reviewable successors to the prototype JavaScript content. They are not loaded by the live runtime yet; that deliberate boundary keeps released browser progress safe while parity is verified.

All packages currently have `status: review`. Source licensing, claim review, and translation review must be completed before they can become `available` in the canonical pipeline.

Regenerate the packages from the current runtime with `npm run migrate:content`, then run `npm run check`. Released `id` and `legacyStorageKey` values must never change.
