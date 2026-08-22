import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const context = vm.createContext({ window: {} });
async function load(file, expose) {
  const source = await readFile(new URL(file, root), 'utf8');
  vm.runInContext(`${source}\nwindow.__value = ${expose};`, context, { filename: file });
  return context.window.__value;
}
function assert(condition, message) { if (!condition) throw new Error(message); }
function text(value, path) { assert(typeof value === 'string' && value.trim(), `${path} must contain text`); }

const catalog = await load('catalog.js', 'expeditionCatalog');
const investigations = await load('investigations.js', 'investigationCopy');
const regions = await load('patagonia-data.js', 'regionExpeditions');
const locales = ['en', 'fr', 'sv'];

assert(catalog.expeditions.length >= 2, 'Catalog needs at least two expeditions');
for (const expedition of catalog.expeditions) {
  text(expedition.id, 'expedition.id');
  assert(new Set(expedition.interests).size === expedition.interests.length, `${expedition.id} has duplicate interests`);
  for (const locale of locales) {
    const copy = expedition.locales[locale];
    assert(copy, `${expedition.id} is missing ${locale}`);
    ['status', 'type', 'title'].forEach(key => text(copy[key], `${expedition.id}.${locale}.${key}`));
  }
}
for (const locale of locales) {
  assert(investigations[locale].length === 3, `Iceland ${locale} must have 3 investigations`);
  investigations[locale].forEach((item, index) => {
    assert(item.evidence.length === 3, `Iceland ${locale} investigation ${index + 1} needs 3 evidence cards`);
    assert(item.options.length === 3 && item.correct >= 0 && item.correct < item.options.length, `Iceland ${locale} investigation ${index + 1} has invalid answers`);
  });
}
for (const region of Object.values(regions)) for (const locale of locales) {
  const copy = region.locales[locale];
  assert(copy?.discoveries.length === 3, `${region.id} ${locale} must have 3 discoveries`);
  copy.discoveries.forEach((item, index) => {
    assert(item.evidence.length === 3 && item.options.length === 3, `${region.id} ${locale} discovery ${index + 1} is incomplete`);
    assert(/^https:\/\//.test(item.source), `${region.id} ${locale} discovery ${index + 1} needs an HTTPS source`);
    assert(item.coordinates.length === 2 && item.coordinates.every(Number.isFinite), `${region.id} ${locale} discovery ${index + 1} has invalid coordinates`);
  });
}
console.log('Content validation passed: 2 expeditions · 3 locales · 18 localized investigations.');
