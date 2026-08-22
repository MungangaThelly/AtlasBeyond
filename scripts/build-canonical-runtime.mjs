import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'content/expeditions');
const files = (await readdir(directory)).filter(file => file.endsWith('.json')).sort();
const packages = {};
for (const file of files) { const content = JSON.parse(await readFile(join(directory, file), 'utf8')); packages[content.id] = content; }
await writeFile(join(root, 'canonical-content.js'), `window.AtlasCanonicalContent=${JSON.stringify(packages)};\n`, 'utf8');
console.log(`Built canonical browser content for ${files.length} expeditions.`);
