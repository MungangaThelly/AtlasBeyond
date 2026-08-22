import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = 4187;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.mjs'], { cwd: new URL('../', import.meta.url), env: { ...process.env, ATLAS_PORT: String(port) }, stdio: 'ignore' });
const required = {
  '/': ['id="onboarding"', 'app.js', 'resilience.js', 'manifest.webmanifest', 'install.js', 'achievements.js'],
  '/atlas.html': ['id="atlas-map"', 'atlas.js', 'resilience.js'],
  '/region-player.html?expedition=patagonia-continents-end': ['id="region-map"', 'class="region-global-nav"', 'id="region-sound-toggle"', 'region-player.js', 'east-africa-data.js', 'central-asia-data.js', 'resilience.js'],
  '/sw.js': ['atlas-beyond-v10'],
  '/offline.html': ['Keep your place']
  ,'/passport.html': ['id="public-passport"', 'passport-page.js']
  ,'/community.html': ['id="community-stats"', 'community.js']
  ,'/daily.html': ['id="daily-challenge"', 'daily.js']
  ,'/seals.html': ['id="seal-grid"', 'seals.js']
  ,'/manifest.webmanifest': ['"display": "standalone"', 'atlas-icon-192.png', 'atlas-icon-512.png']
  ,'/assets/atlas-icon.svg': ['<svg']
  ,'/assets/atlas-icon-192.png': []
  ,'/assets/atlas-icon-512.png': []
  ,'/assets/expeditions/iceland.jpg': []
  ,'/assets/expeditions/patagonia.jpg': []
  ,'/assets/expeditions/east-africa.jpg': []
  ,'/assets/expeditions/central-asia.jpg': []
};
try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    await delay(100);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
  }
  if (!ready) throw new Error('Test server did not start');
  for (const [path, markers] of Object.entries(required)) {
    const response = await fetch(origin + path);
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    const body = await response.text();
    for (const marker of markers) if (!body.includes(marker)) throw new Error(`${path} is missing ${marker}`);
  }
  const missing = await fetch(origin + '/definitely-missing');
  if (missing.status !== 404) throw new Error(`Missing page returned ${missing.status}`);
  console.log('Smoke test passed: hub, atlas, region player, offline shell, and 404 behavior.');
} finally {
  server.kill();
}
