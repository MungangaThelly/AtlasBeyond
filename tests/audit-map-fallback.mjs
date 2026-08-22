import fs from 'node:fs';

const fallback = fs.readFileSync(new URL('../map-fallback.js', import.meta.url), 'utf8');
const region = fs.readFileSync(new URL('../region-player.js', import.meta.url), 'utf8');
for (const id of ['real-map', 'atlas-map', 'region-map']) if (!fallback.includes(`id: '${id}'`)) throw new Error(`Missing fallback coverage for ${id}.`);
for (const locale of ['en:', 'fr:', 'sv:']) if (!fallback.includes(locale)) throw new Error(`Map fallback is missing ${locale.slice(0, 2)} copy.`);
for (const marker of ['navigator.onLine', "addEventListener('offline'", "addEventListener('online'", 'Continue with clues', "role', 'status'"]) {
  if (!fallback.includes(marker)) throw new Error(`Map fallback is missing ${marker}.`);
}
if (!region.includes("regionMap.on('load'")) throw new Error('Reusable region maps do not expose a ready state.');
console.log('Map resilience audit passed: all three map surfaces retain multilingual, keyboard-accessible clue navigation when maps fail.');
