import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const locales = ['en', 'fr', 'sv'];
const load = async (file, expose, transform = source => source) => {
  const context = vm.createContext({ window: {} });
  const source = transform(await readFile(new URL(file, root), 'utf8'));
  vm.runInContext(`${source}\nwindow.__value = ${expose};`, context, { filename: file });
  return context.window.__value;
};
const readPackage = async id => JSON.parse(await readFile(new URL(`content/expeditions/${id}.json`, root), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const catalogContext = vm.createContext({ window: {} });
vm.runInContext(await readFile(new URL('catalog.js', root), 'utf8'), catalogContext, { filename: 'catalog.js' });
vm.runInContext(await readFile(new URL('iceland-expansion.js', root), 'utf8'), catalogContext, { filename: 'iceland-expansion.js' });
vm.runInContext('window.__value = expeditionCatalog', catalogContext);
const catalog = catalogContext.window.__value;
const investigations = await load('investigations.js', 'investigationCopy');
const iceland = await load('app.js', '({places,copy})', source => source.split('const $=')[0]);
const regionContext = vm.createContext({ window: {} });
for (const file of ['patagonia-data.js', 'east-africa-data.js', 'central-asia-data.js']) vm.runInContext(await readFile(new URL(file, root), 'utf8'), regionContext, { filename: file });
vm.runInContext('window.__value = regionExpeditions', regionContext);
const regions = regionContext.window.__value;

assert(catalog.expeditions.length === 4, 'Runtime catalog must contain four expeditions');
const packages = await Promise.all(catalog.expeditions.map(item => readPackage(item.id)));
assert(new Set(packages.map(item => item.id)).size === packages.length, 'Migrated expedition IDs must be unique');
const generated = await load('canonical-content.js', 'window.AtlasCanonicalContent');
for (const content of packages) assert(JSON.stringify(generated[content.id]) === JSON.stringify(content), `${content.id} generated browser bundle is stale; run npm run build:content`);

const icelandPackage = packages[0];
assert(icelandPackage.id === 'iceland-fire-ice' && icelandPackage.legacyStorageKey === 'atlas-journal', 'Iceland progress identity changed');
const icelandCore = icelandPackage.discoveries.filter(item => item.kind === 'investigation');
const icelandNotes = icelandPackage.discoveries.filter(item => item.kind === 'field-note');
assert(icelandCore.length === iceland.places.length, 'Iceland investigation count differs from runtime');
assert(icelandNotes.length === catalog.sideDiscoveries.length, 'Iceland field-note count differs from runtime');
assert(JSON.stringify(icelandNotes.map(item => item.id)) === JSON.stringify(catalog.sideDiscoveries.map(item => item.id)), 'Iceland field-note IDs changed');
icelandCore.forEach((discovery, index) => {
  const place = iceland.places[index];
  assert(discovery.id === place.id, `Iceland discovery ${index + 1} ID changed`);
  assert(JSON.stringify(discovery.coordinates) === JSON.stringify(place.coordinates), `Iceland ${discovery.id} coordinates changed`);
  for (const locale of locales) {
    assert(discovery.locales[locale].correct === investigations[locale][index].correct, `Iceland ${discovery.id} ${locale} correct answer changed`);
    assert(JSON.stringify(discovery.locales[locale].options) === JSON.stringify(investigations[locale][index].options), `Iceland ${discovery.id} ${locale} options changed`);
  }
});

for (let packageIndex = 1; packageIndex < packages.length; packageIndex++) {
  const content = packages[packageIndex], runtime = regions[content.id];
  assert(runtime, `${content.id} is absent from the runtime`);
  assert(content.legacyStorageKey === runtime.storageKey, `${content.id} progress storage key changed`);
  assert(content.discoveries.length === runtime.locales.en.discoveries.length, `${content.id} discovery count differs from runtime`);
  content.discoveries.forEach((discovery, index) => {
    assert(JSON.stringify(discovery.coordinates) === JSON.stringify(runtime.locales.en.discoveries[index].coordinates), `${content.id} discovery ${index + 1} coordinates changed`);
    for (const locale of locales) {
      const migrated = discovery.locales[locale], original = runtime.locales[locale].discoveries[index];
      assert(migrated.place === original.place, `${content.id} discovery ${index + 1} ${locale} place changed`);
      assert(migrated.correct === original.correct, `${content.id} discovery ${index + 1} ${locale} correct answer changed`);
      assert(JSON.stringify(migrated.options) === JSON.stringify(original.options), `${content.id} discovery ${index + 1} ${locale} options changed`);
    }
  });
}

console.log('Migration parity passed: 4 progress keys · 12 required investigations · 9 Iceland field notes · 36 localized deductions preserved.');
