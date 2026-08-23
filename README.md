# Atlas Beyond

**One planet. Thousands of languages. Infinite stories.**

Live site: <https://atlas.nuhar.se>

Atlas Beyond is a curiosity-driven exploration platform where the real Earth is
the open world. Players follow clues, interpret evidence, discover places, and
preserve what they learn in an Explorer's Journal.

## Run the prototype

Run `npm run dev`, then visit <http://127.0.0.1:4173>.

Do not open `index.html` through a `file://` URL. MapLibre uses browser workers
and remote map resources that require a normal HTTP origin. The included local
server has no package dependencies and listens only on this computer.

## Included

- A clue-led Iceland expedition on a real interactive map
- Evidence-card investigations and deduction challenges
- Twelve Iceland discoveries: three required investigations and nine optional field notes
- Geology, Ecology, History, Navigation, and Cartography progression with skill-gated explorer lenses
- Explorer dashboard, rank, statistics, and the first achievement
- Contextual expedition guide and first-time map orientation
- Optional procedural ambient sound and persistent day/night atmosphere
- Data-driven expedition catalog and player-interest recommendations
- Optional verified field notes that do not block the main route
- A second playable expedition in Patagonia using the reusable region player
- A third playable expedition across East Africa’s Serengeti and Ngorongoro landscape
- A fourth playable expedition across Central Asia’s Silk Roads
- Nine optional, skill-linked field notes in each reusable regional expedition
- A global globe atlas with filters, completion state, and future-region paths
- A multilingual daily evidence briefing with streaks and rare field seals
- Explicit opt-in controls for privacy-safe anonymous community totals
- Validated local explorer-data export, restore, and confirmed browser-data reset
- Accessible in-app release notices for safe offline-shell updates
- Multilingual clue-first fallbacks when live maps or tiles are unavailable
- A multilingual offline recovery page with live retry and cached-hub access
- Locally vendored and integrity-checked MapLibre runtime assets
- English, French, and Swedish interfaces
- Responsive, keyboard-accessible interaction
- A personalized World Synthesis finale connecting discoveries, knowledge paths, seals, and completed horizons
- Canonical social previews, crawler policy, sitemap, and automated public-launch readiness checks
- Product vision and technical architecture documents

Discoveries are earned through observation: review three pieces of geographic
evidence, choose the explanation that fits all of them, and preserve the
resulting deduction in the Explorer's Journal.

The prototype uses MapLibre GL JS and live OpenStreetMap tiles with visible
attribution. OpenStreetMap's public tile service is appropriate only for this
low-traffic prototype; production will use a dedicated provider or tile stack.

See [content sources](docs/CONTENT_SOURCES.md) for expedition provenance.
See [content schema](docs/CONTENT_SCHEMA.md) to add future regions.

## Quality checks

Run `npm run check` before sharing a change. It checks JavaScript syntax,
validates the localized expedition content, starts an isolated test server, and
smoke-tests the hub, world atlas, region player, offline shell, and 404 behavior.

Run `npm run test:e2e` for the Playwright desktop-and-mobile browser gate. It
verifies primary routes, onboarding, a complete discovery, locale persistence,
regional controls, responsive overflow, keyboard entry, and dialog naming. The
deployment workflow runs both quality suites before publishing.

Once a page has been visited over HTTP, its local experience shell is cached for
resilient loading. Live map tiles still require a network connection.
When a new shell is ready, Atlas Beyond asks the explorer before activating and
refreshing it; journal progress remains in browser storage throughout.
If MapLibre or live map tiles cannot load, the expedition explains the problem
and moves focus to the next evidence or region-list action.
MapLibre GL JS 5.24.0 is served from the application itself and cached with the
offline shell; reviewed hashes and its license are tracked in the repository.
