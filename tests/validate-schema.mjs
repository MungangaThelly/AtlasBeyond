import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const schema = JSON.parse(await readFile(join(root, 'content/schema/expedition.schema.json'), 'utf8'));
const fixture = JSON.parse(await readFile(join(root, 'tests/fixtures/valid-expedition.json'), 'utf8'));
const failures = [];
const fail = (path, message) => failures.push(`${path}: ${message}`);
const typeOf = value => value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;
const resolve = ref => ref.slice(2).split('/').reduce((value, key) => value[key.replace(/~1/g, '/').replace(/~0/g, '~')], schema);

function validate(value, rule, path = '$') {
  if (rule.$ref) return validate(value, resolve(rule.$ref), path);
  if (rule.const !== undefined && value !== rule.const) fail(path, `must equal ${JSON.stringify(rule.const)}`);
  if (rule.enum && !rule.enum.includes(value)) fail(path, `must be one of ${rule.enum.join(', ')}`);
  if (rule.type) {
    const allowed = Array.isArray(rule.type) ? rule.type : [rule.type], actual = typeOf(value);
    if (!allowed.includes(actual) && !(actual === 'integer' && allowed.includes('number'))) { fail(path, `must be ${allowed.join(' or ')}, received ${actual}`); return; }
  }
  if (typeof value === 'string') {
    if (rule.minLength && value.trim().length < rule.minLength) fail(path, `must contain at least ${rule.minLength} character`);
    if (rule.maxLength && value.length > rule.maxLength) fail(path, `must contain at most ${rule.maxLength} characters`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) fail(path, `does not match ${rule.pattern}`);
    if (rule.format === 'uri' && !/^https:\/\/[^\s]+$/i.test(value)) fail(path, 'must be an HTTPS URI');
    if (rule.format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(path, 'must use YYYY-MM-DD');
    if (rule.format === 'date-time' && Number.isNaN(Date.parse(value))) fail(path, 'must be a valid date-time');
  }
  if (typeof value === 'number') {
    if (rule.minimum !== undefined && value < rule.minimum) fail(path, `must be at least ${rule.minimum}`);
    if (rule.maximum !== undefined && value > rule.maximum) fail(path, `must be at most ${rule.maximum}`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) fail(path, `needs at least ${rule.minItems} items`);
    if (rule.maxItems !== undefined && value.length > rule.maxItems) fail(path, `allows at most ${rule.maxItems} items`);
    if (rule.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) fail(path, 'must not contain duplicates');
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, `${path}[${index}]`));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of rule.required || []) if (!(key in value)) fail(path, `is missing required property ${key}`);
    for (const [key, child] of Object.entries(value)) {
      if (rule.properties?.[key]) validate(child, rule.properties[key], `${path}.${key}`);
      else if (rule.additionalProperties === false) fail(`${path}.${key}`, 'is not an allowed property');
    }
  }
}

function semanticValidate(data, label) {
  const sourceIds = new Set(data.sources.map(source => source.id));
  const discoveryIds = new Set();
  const orders = new Set();
  for (const [index, discovery] of data.discoveries.entries()) {
    const path = `${label}.discoveries[${index}]`;
    if (discoveryIds.has(discovery.id)) fail(`${path}.id`, 'duplicates another discovery ID');
    if (orders.has(discovery.order)) fail(`${path}.order`, 'duplicates another discovery order');
    discoveryIds.add(discovery.id); orders.add(discovery.order);
    const [longitude, latitude] = discovery.coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) fail(`${path}.coordinates`, 'must contain valid longitude and latitude');
    if (!data.knowledgePaths.includes(discovery.knowledgeReward.path)) fail(`${path}.knowledgeReward.path`, 'must be declared by the expedition');
    const claimIds = new Set(discovery.claims.map(claim => claim.id));
    for (const claim of discovery.claims) for (const sourceId of claim.sourceIds) if (!sourceIds.has(sourceId)) fail(`${path}.claims.${claim.id}`, `references unknown source ${sourceId}`);
    if (discovery.kind === 'field-note' && !discovery.optional) fail(`${path}.optional`, 'field notes must be optional');
    const optionCount = discovery.locales.en.options?.length;
    for (const locale of ['en', 'fr', 'sv']) {
      const copy = discovery.locales[locale];
      if (discovery.kind === 'investigation') {
        for (const key of ['fieldNote', 'evidence', 'question', 'options', 'correct']) if (copy[key] === undefined) fail(`${path}.locales.${locale}`, `investigations require ${key}`);
        if (copy.options?.length !== optionCount) fail(`${path}.locales.${locale}.options`, 'must match the English option count');
        if (copy.correct >= copy.options.length) fail(`${path}.locales.${locale}.correct`, 'must point to an available option');
        if (copy.correct !== discovery.locales.en.correct) fail(`${path}.locales.${locale}.correct`, 'must match the English correct-answer index');
      }
      for (const evidence of copy.evidence || []) for (const claimId of evidence.claimIds) if (!claimIds.has(claimId)) fail(`${path}.locales.${locale}.evidence`, `references unknown claim ${claimId}`);
    }
  }
  if (data.status === 'available') {
    if (data.editorial.reviewStatus !== 'reviewed' || !data.editorial.reviewedBy || !data.editorial.reviewedAt) fail(`${label}.editorial`, 'available content must have a completed editorial review');
    for (const source of data.sources) if (source.license.status !== 'approved') fail(`${label}.sources.${source.id}.license`, 'available content requires approved source licensing');
    for (const discovery of data.discoveries) for (const claim of discovery.claims) if (claim.reviewStatus !== 'reviewed') fail(`${label}.${discovery.id}.${claim.id}`, 'available content requires reviewed claims');
  }
}

function run(data, label) { validate(data, schema, label); semanticValidate(data, label); }
run(fixture, 'fixture');

const expeditionDirectory = join(root, 'content/expeditions');
let packageFiles = [];
try { packageFiles = (await readdir(expeditionDirectory)).filter(file => file.endsWith('.json')).sort(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const file of packageFiles) run(JSON.parse(await readFile(join(expeditionDirectory, file), 'utf8')), file);

const broken = structuredClone(fixture);
broken.discoveries[0].locales.fr.evidence[0].claimIds = ['missing-claim'];
const beforeNegativeCheck = failures.length;
semanticValidate(broken, 'negative-check');
if (failures.length === beforeNegativeCheck) throw new Error('Validator negative check failed to detect a broken claim reference');
failures.splice(beforeNegativeCheck);

if (failures.length) throw new Error(`Content contract validation failed:\n- ${failures.join('\n- ')}`);
console.log(`Schema validation passed: Draft 2020-12 contract · semantic trust rules · ${packageFiles.length} migrated expedition package${packageFiles.length === 1 ? '' : 's'}.`);
