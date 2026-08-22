import fs from 'node:fs';

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const manager = fs.readFileSync(new URL('../update-manager.js', import.meta.url), 'utf8');
const installHandler = /addEventListener\('install',[\s\S]*?\n}\);/.exec(sw)?.[0] || '';
if (!installHandler || installHandler.includes('skipWaiting')) throw new Error('Service worker updates bypass the explorer confirmation.');
if (!/event\.data\?\.type === 'SKIP_WAITING'/.test(sw)) throw new Error('Service worker has no explicit activation message.');
for (const marker of ['en:', 'fr:', 'sv:', 'registration?.waiting', 'controllerchange', 'aria-live', 'Update now', 'Later']) {
  if (!manager.includes(marker)) throw new Error(`Update manager is missing ${marker}.`);
}
if (!/refreshing = true;\s*location\.reload\(\)/.test(manager)) throw new Error('Update manager does not guard the one-time refresh.');
console.log('PWA update audit passed: releases wait for consent, announce accessibly, and refresh exactly once after activation.');
