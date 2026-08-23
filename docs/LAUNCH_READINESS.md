# Public-launch readiness

Updated 2026-08-23.

## Technically ready

- Custom HTTPS domain and canonical URLs
- Search crawler policy and XML sitemap
- Open Graph and social-card metadata
- Installable offline-capable PWA with a stable application identity
- Desktop and mobile browser release gate
- Accessibility, localization, schema, privacy, data portability, map fallback, and offline checks
- GitHub Pages deployment only after all automated checks pass

## Editorial release condition

The experience is technically publishable, but canonical expedition packages remain marked `review`. UNESCO, Smithsonian, Argentina National Parks, and Vatnajökull National Park references are facts-only editorial drafts pending the source-specific rights decisions recorded in `SOURCE_RIGHTS_REVIEW.md`. Do not represent those packages as editorially approved until that review is complete.

## Operational watch items

- Replace public OpenStreetMap prototype tiles with a production tile provider before sustained traffic.
- Monitor GitHub Pages deployment health and the Supabase anonymous-community opt-in path.
- Run `npm run check` and `npm run test:e2e` before every release.
