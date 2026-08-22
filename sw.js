const CACHE = 'atlas-beyond-v4';
const SHELL = [
  './', './index.html', './atlas.html', './region-player.html?expedition=patagonia-continents-end',
  './styles.css', './map.css', './onboarding.css', './evidence.css', './progression.css',
  './living-world.css', './hub.css', './navigation.css', './atlas.css', './region-player.css',
  './app.js', './investigations.js', './progression.js', './catalog.js', './living-world.js',
  './atlas.js', './patagonia-data.js', './east-africa-data.js', './central-asia-data.js', './region-player.js', './passport.html', './passport.js', './passport-page.js', './passport.css', './community.html', './community.js', './community-client.js', './community-config.js', './community.css', './resilience.js', './resilience.css', './visual-art.css', './daily.html', './daily.js', './daily.css', './seals.html', './seals.js', './seals.css',
  './assets/expeditions/iceland.jpg', './assets/expeditions/patagonia.jpg', './assets/expeditions/east-africa.jpg', './assets/expeditions/central-asia.jpg', './offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./offline.html') : Response.error()))));
});
