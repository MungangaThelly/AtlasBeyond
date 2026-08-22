import crypto from 'node:crypto';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const expected = {
  'vendor/maplibre-gl/maplibre-gl.js': '45a9b07a9189ce56054c620a947ccf41e291e58c95e9b61533b740aaa65ee5cb',
  'vendor/maplibre-gl/maplibre-gl.css': 'ab1e70d59ec40465bae7e7030da2f3ccf28133fd502e62bd598eefbadfd7a732',
  'vendor/maplibre-gl/LICENSE.txt': 'ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2'
};
for (const [file, hash] of Object.entries(expected)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(new URL(`../${file}`, import.meta.url))).digest('hex');
  if (actual !== hash) throw new Error(`${file} differs from the reviewed MapLibre 5.24.0 vendor asset.`);
}
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(new URL(file, root), 'utf8');
  if (/unpkg\.com\/maplibre/i.test(html)) throw new Error(`${file} still depends on the MapLibre CDN.`);
}
for (const file of ['index.html', 'atlas.html', 'region-player.html']) {
  const html = fs.readFileSync(new URL(file, root), 'utf8');
  if (!html.includes('vendor/maplibre-gl/maplibre-gl.js?v=5.24.0') || !html.includes('vendor/maplibre-gl/maplibre-gl.css?v=5.24.0')) throw new Error(`${file} does not load the reviewed local MapLibre version.`);
}
console.log('Vendored MapLibre audit passed: three map routes use reviewed local 5.24.0 assets with stable hashes and license.');
