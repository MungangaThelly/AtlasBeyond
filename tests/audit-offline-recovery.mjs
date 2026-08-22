import fs from 'node:fs';

const html = fs.readFileSync(new URL('../offline.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../offline.js', import.meta.url), 'utf8');
for (const marker of ['role="status"', 'aria-live="polite"', 'id="retry-connection"', 'id="return-cached"', 'id="offline-language"']) if (!html.includes(marker)) throw new Error(`Offline page is missing ${marker}.`);
for (const marker of ['en:', 'fr:', 'sv:', "addEventListener('online'", "addEventListener('offline'", "cache: 'no-store'", 'location.href']) if (!script.includes(marker)) throw new Error(`Offline recovery is missing ${marker}.`);
console.log('Offline recovery audit passed: localized status, retry, connectivity events, and cached-hub navigation are present.');
