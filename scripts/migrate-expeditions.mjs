import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const locales = ['en', 'fr', 'sv'];
const clean = value => String(value).replace(/<br\s*\/?\s*>/gi, ' ').replace(/\s+/g, ' ').trim();
const slug = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const evaluate = async (file, expose, transform = source => source) => {
  const context = vm.createContext({ window: {} });
  const source = transform(await readFile(join(root, file), 'utf8'));
  vm.runInContext(`${source}\nwindow.__content = ${expose};`, context, { filename: file });
  return context.window.__content;
};

const catalogContext = vm.createContext({ window: {} });
vm.runInContext(await readFile(join(root, 'catalog.js'), 'utf8'), catalogContext, { filename: 'catalog.js' });
vm.runInContext(await readFile(join(root, 'iceland-expansion.js'), 'utf8'), catalogContext, { filename: 'iceland-expansion.js' });
vm.runInContext('window.__content = expeditionCatalog', catalogContext);
const catalog = catalogContext.window.__content;
const investigations = await evaluate('investigations.js', 'investigationCopy');
const iceland = await evaluate('app.js', '({places,copy})', source => source.split('const $=')[0]);
const context = vm.createContext({ window: {} });
for (const file of ['patagonia-data.js', 'east-africa-data.js', 'central-asia-data.js']) vm.runInContext(await readFile(join(root, file), 'utf8'), context, { filename: file });
vm.runInContext('window.__content = regionExpeditions', context);
const regions = context.window.__content;

const publisherFor = url => {
  const host = new URL(url).hostname.replace(/^www\./, '');
  if (host.includes('unesco.org')) return 'UNESCO World Heritage Centre';
  if (host.includes('nasa.gov')) return 'NASA';
  if (host.includes('argentina.gob.ar')) return 'Argentina National Parks';
  if (host.includes('si.edu')) return 'Smithsonian Institution';
  if (host.includes('vatnajokulsthjodgardur.is')) return 'Vatnajökull National Park';
  return host;
};
const sourceIdFor = url => `source-${slug(new URL(url).hostname)}-${Math.abs([...url].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 7)).toString(36)}`;
const rightsFor = url => {
  const host = new URL(url).hostname;
  if (host.includes('nasa.gov')) return { status: 'approved', usage: 'attributed-summary', termsUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', reviewedAt: '2026-08-23', reviewedBy: 'Atlas Beyond rights audit', notes: 'NASA permits factual, informational use without implied endorsement; Atlas Beyond uses original summaries and attribution only.' };
  if (host.includes('si.edu')) return { status: 'restricted', usage: 'facts-only', termsUrl: 'https://www.si.edu/termsofuse', reviewedAt: '2026-08-23', reviewedBy: 'Atlas Beyond rights audit', notes: 'No Smithsonian text or media may be reproduced. Commercial use requires separate clearance unless the specific asset is CC0.' };
  if (host.includes('unesco.org')) return { status: 'review-required', usage: 'facts-only', termsUrl: 'https://whc.unesco.org/en/licenses', reviewedAt: '2026-08-23', reviewedBy: 'Atlas Beyond rights audit', notes: 'UNESCO licenses are work-specific. Retain link and independently written factual summary; verify the source page license before release.' };
  if (host.includes('argentina.gob.ar')) return { status: 'review-required', usage: 'facts-only', termsUrl: 'https://www.argentina.gob.ar/transparencia-activa/portales-de-datos-abiertos', reviewedAt: '2026-08-23', reviewedBy: 'Atlas Beyond rights audit', notes: 'Argentina promotes reuse of designated open datasets, but these park webpages do not expose a verified dataset license.' };
  return { status: 'review-required', usage: 'facts-only', termsUrl: null, reviewedAt: '2026-08-23', reviewedBy: 'Atlas Beyond rights audit', notes: 'No explicit reuse terms located. Retain link and independently written factual summary; obtain permission or legal review before release.' };
};
const sourceRecord = (url, title) => ({ id: sourceIdFor(url), title, publisher: publisherFor(url), url, accessedAt: '2026-08-23', license: rightsFor(url) });
const editorial = { contentVersion: '1.0.0', reviewStatus: 'in-review', reviewedBy: null, reviewedAt: null };

function packageBase(catalogEntry, sequence, region, center, zoom, storageKey, localCopy) {
  return {
    schemaVersion: 1, id: catalogEntry.id, legacyStorageKey: storageKey, status: 'review', sequence,
    region: { name: region, center, zoom }, interests: catalogEntry.interests, knowledgePaths: ['geology', 'cartography'], editorial,
    sources: [], locales: Object.fromEntries(locales.map(locale => [locale, { title: clean(localCopy[locale].title), eyebrow: clean(localCopy[locale].eyebrow), intro: clean(localCopy[locale].intro) }])), discoveries: []
  };
}

function migrateRegion(catalogEntry, sequence, region) {
  const result = packageBase(catalogEntry, sequence, region.region, region.center, region.zoom, region.storageKey, region.locales);
  const urls = [...new Set(region.locales.en.discoveries.map(item => item.source))];
  result.sources = urls.map(url => sourceRecord(url, region.locales.en.discoveries.find(item => item.source === url).place));
  result.discoveries = region.locales.en.discoveries.map((english, index) => {
    const id = slug(english.place), claimId = `${id}-core-claim`;
    return {
      id, kind: 'investigation', order: index + 1, optional: false, coordinates: english.coordinates, categories: catalogEntry.interests,
      knowledgeReward: { path: 'geology', points: 1, unlockLevel: index },
      claims: [{ id: claimId, text: english.reveal, sourceIds: [sourceIdFor(english.source)], reviewStatus: 'draft', uncertainty: 'low' }],
      locales: Object.fromEntries(locales.map(locale => {
        const item = region.locales[locale].discoveries[index];
        return [locale, { place: item.place, clue: item.clue, fieldNote: item.field, evidence: item.evidence.map(entry => ({ label: entry[0], text: entry[1], claimIds: [claimId] })), question: item.question, options: item.options, correct: item.correct, reveal: item.reveal }];
      }))
    };
  });
  return result;
}

function migrateIceland(catalogEntry) {
  const localCopy = Object.fromEntries(locales.map(locale => [locale, { title: iceland.copy[locale].title, eyebrow: iceland.copy[locale].eyebrow, intro: iceland.copy[locale].intro }]));
  const result = packageBase(catalogEntry, 1, 'Iceland', [-16.7, 64.03], 6.2, 'atlas-journal', localCopy);
  const sideNotes = catalog.sideDiscoveries;
  const allSources = [...iceland.places.map(place => ({ url: place.source, title: place.name })), ...sideNotes.map(note => ({ url: note.source, title: note.locales.en.title }))];
  result.sources = [...new Map(allSources.map(source => [source.url, source])).values()].map(source => sourceRecord(source.url, source.title));
  result.discoveries = iceland.places.map((place, index) => {
    const claimId = `${place.id}-core-claim`;
    return {
      id: place.id, kind: 'investigation', order: index + 1, optional: false, coordinates: place.coordinates, categories: ['geology'],
      knowledgeReward: { path: 'geology', points: 1, unlockLevel: index },
      claims: [{ id: claimId, text: investigations.en[index].right, sourceIds: [sourceIdFor(place.source)], reviewStatus: 'draft', uncertainty: 'low' }],
      locales: Object.fromEntries(locales.map(locale => {
        const item = investigations[locale][index], guide = iceland.copy[locale];
        return [locale, { place: guide.discoveries[index][0], clue: guide.clues[index][0], fieldNote: guide.clues[index][2], evidence: item.evidence.map(entry => ({ label: entry[0], text: `${entry[1]}. ${entry[2]}`, claimIds: [claimId] })), question: item.question, options: item.options, correct: item.correct, reveal: item.right }];
      }))
    };
  });
  result.discoveries.push(...sideNotes.map((note, index) => {
    const claimId = `${note.id}-field-claim`;
    return { id: note.id, kind: 'field-note', order: result.discoveries.length + index + 1, optional: true, coordinates: note.coordinates, categories: [note.interest], knowledgeReward: { path: note.skillPath||'geology', points: 1, unlockLevel: note.unlockLevel||0 }, claims: [{ id: claimId, text: note.locales.en.copy, sourceIds: [sourceIdFor(note.source)], reviewStatus: 'reviewed', uncertainty: 'low' }], locales: Object.fromEntries(locales.map(locale => [locale, { place: note.locales[locale].title, clue: note.locales[locale].type, reveal: note.locales[locale].copy }])) };
  }));
  result.knowledgePaths = [...new Set(result.discoveries.map(item => item.knowledgeReward.path))];
  return result;
}

const packages = [migrateIceland(catalog.expeditions[0])];
for (const [index, entry] of catalog.expeditions.slice(1).entries()) packages.push(migrateRegion(entry, index + 2, regions[entry.id]));
const output = join(root, 'content/expeditions');
await mkdir(output, { recursive: true });
for (const content of packages) await writeFile(join(output, `${content.id}.json`), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
console.log(`Migrated ${packages.length} expedition packages with ${packages.reduce((sum, item) => sum + item.discoveries.length, 0)} stable discoveries.`);
