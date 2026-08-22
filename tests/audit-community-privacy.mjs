import fs from 'node:fs';
import vm from 'node:vm';

const values = new Map();
let requests = 0;
const localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value))
};
const window = { ATLAS_COMMUNITY: { url: 'https://example.invalid', key: 'public-test-key' } };
const context = {
  window,
  localStorage,
  location: { protocol: 'https:' },
  crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
  console,
  fetch: async () => { requests += 1; return { ok: true, status: 200, json: async () => null }; }
};
vm.runInNewContext(fs.readFileSync(new URL('../community-client.js', import.meta.url), 'utf8'), context);

if (requests !== 0) throw new Error('Community client transmitted data before consent.');
await window.AtlasCommunity.sync();
if (requests !== 0) throw new Error('Community sync transmitted data while participation was disabled.');
await window.AtlasCommunity.setParticipation(true);
if (requests !== 1 || !window.AtlasCommunity.participates()) throw new Error('Opt-in did not enable one privacy-safe synchronization.');
await window.AtlasCommunity.setParticipation(false);
await window.AtlasCommunity.sync();
if (requests !== 1 || window.AtlasCommunity.participates()) throw new Error('Opt-out did not stop later synchronization.');
console.log('Community privacy audit passed: no transmission before opt-in, and opt-out stops future synchronization.');
