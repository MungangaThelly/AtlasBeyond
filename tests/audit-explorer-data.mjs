import fs from 'node:fs';
import vm from 'node:vm';

class MemoryStorage {
  constructor(entries) { this.values = new Map(entries); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
const storage = new MemoryStorage([
  ['atlas-profile', '{"name":"Explorer"}'],
  ['atlas-journal', '["thingvellir"]'],
  ['unrelated-setting', 'keep-me']
]);
const context = { localStorage: storage, window: {}, globalThis: {}, Date };
vm.runInNewContext(fs.readFileSync(new URL('../explorer-data.js', import.meta.url), 'utf8'), context);
const api = context.window.AtlasExplorerData;
const exported = api.collect(storage);
if (exported.product !== 'Atlas Beyond' || exported.version !== 1) throw new Error('Export metadata is incomplete.');
if (exported.data['atlas-profile']?.name !== 'Explorer' || exported.data['atlas-journal']?.[0] !== 'thingvellir') throw new Error('Portable export did not preserve explorer data.');
if ('unrelated-setting' in exported.data) throw new Error('Export included unrelated browser data.');
if (api.clear(storage) !== 2) throw new Error('Reset did not report the expected Atlas records.');
if (storage.getItem('atlas-profile') !== null || storage.getItem('atlas-journal') !== null) throw new Error('Reset left Atlas records behind.');
if (storage.getItem('unrelated-setting') !== 'keep-me') throw new Error('Reset removed unrelated browser data.');
const invalid = { product: 'Atlas Beyond', version: 1, data: { 'unrelated-setting': 'attack' } };
if (api.validate(invalid)) throw new Error('Validation accepted an archive containing an unrelated key.');
let rejected = false;
try { api.restore(invalid, storage); } catch { rejected = true; }
if (!rejected || storage.getItem('unrelated-setting') !== 'keep-me') throw new Error('Invalid restore altered browser data.');
const valid = { product: 'Atlas Beyond', version: 1, data: { 'atlas-profile': { name: 'Restored Explorer' }, 'atlas-journal': ['geysir'] } };
if (!api.validate(valid) || api.restore(valid, storage) !== 2) throw new Error('Valid archive was not restored.');
if (JSON.parse(storage.getItem('atlas-profile')).name !== 'Restored Explorer' || JSON.parse(storage.getItem('atlas-journal'))[0] !== 'geysir') throw new Error('Restored progress does not match the archive.');
if (storage.getItem('unrelated-setting') !== 'keep-me') throw new Error('Restore changed unrelated browser data.');
console.log('Explorer data audit passed: export, validation, restore, and reset remain strictly scoped to Atlas Beyond.');
