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

const catalog = await load('catalog.js', 'expeditionCatalog');
const investigations = await load('investigations.js', 'investigationCopy');
const iceland = await load('app.js', '({places,copy})', source => source.split('const $=')[0]);
const regionContext = vm.createContext({ window: {} });
for (const file of ['patagonia-data.js', 'east-africa-data.js', 'central-asia-data.js']) vm.runInContext(await readFile(new URL(file, root), 'utf8'), regionContext, { filename: file });
vm.runInContext('window.__value = regionExpeditions', regionContext);
const regions = regionContext.window.__value;

assert(catalog.expeditions.length === 4, 'Runtime catalog must contain four expeditions');
const packages = await Promise.all(catalog.expeditions.map(item => readPackage(item.id)));
assert(new Set(packages.map(item => item.id)).size === packages.length, 'Migrated expedition IDs must be unique');

const icelandPackage = packages[0];
assert(icelandPackage.id === 'iceland-fire-ice' && icelandPackage.legacyStorageKey === 'atlas-journal', 'Iceland progress identity changed');
assert(icelandPackage.discoveries.length === iceland.places.length, 'Iceland discovery count differs from runtime');
icelandPackage.discoveries.forEach((discovery, index) => {
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

console.log('Migration parity passed: 4 expedition IDs · 4 progress keys · 12 discoveries · 36 localized deductions preserved.');
