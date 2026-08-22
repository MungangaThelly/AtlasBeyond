# Atlas Beyond — Technical Architecture

## Direction

Geography, editorial content, player progress, localization, and AI guidance
remain separate so the platform can start with one region and expand safely.

## Proposed stack

- Client: TypeScript, React, MapLibre GL JS
- API: TypeScript with Fastify or NestJS
- Geographic data: PostgreSQL with PostGIS
- Search: PostgreSQL initially; OpenSearch when justified
- Media: Object storage and CDN
- Identity: OpenID Connect
- Content: Dedicated editorial and review application
- AI guide: Retrieval over approved, versioned sources

The current prototype uses plain HTML, CSS, and JavaScript to validate the
interaction rather than prematurely committing to production infrastructure.

## Boundaries

```text
Explorer client
  ├── Map and discovery experience
  ├── Expedition state and journal
  ├── Accessibility and localization
  └── Application API
        ├── PostGIS: places, routes, regions
        ├── Content store: clues, stories, citations
        ├── Media store: imagery, audio, 3D assets
        └── AI guide: approved-source retrieval only
```

## Core model

- **Place:** stable ID, geometry, local names, categories, sensitivity, sources.
- **Discovery:** clue, evidence, reveal rules, learning content, citations.
- **Expedition:** graph of discoveries, prerequisites, branches, completion.
- **Journal entry:** discovery, date, notes, media, locale, content version.
- **Knowledge path:** cartography, geology, ecology, history, or culture.

## Localization and trust

Translations use stable keys and record locale, attribution, review status, and
source version. Local endonyms remain visible. Machine translation may create
drafts but cannot silently replace reviewed cultural or historical content.

Every source needs license review and claim-level provenance. Sensitive sites
may require blurred coordinates or exclusion. The AI guide retrieves factual
material only from approved content, cites it, and admits missing evidence.

## Delivery phases

1. Concept prototype
2. Iceland vertical slice with real maps and reviewed content
3. Editorial, provenance, and localization pipeline
4. Regional expedition packs
5. Moderated community and living-Earth layers
