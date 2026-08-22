import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const sourceFiles = fs.readdirSync(root).filter(file => /\.(?:html|js|css|json|webmanifest)$/.test(file));
const errors = [];
for (const file of sourceFiles) {
  const source = fs.readFileSync(new URL(file, root), 'utf8');
  if (source.includes('\uFFFD')) errors.push(`${file}: contains the Unicode replacement character`);
  if (/Ã.|Â.|â(?:€|€™|€œ|€|†|‡|ˆ|‰|Š|‹|Œ|Ž)/.test(source)) errors.push(`${file}: contains likely UTF-8 mojibake`);
}

for (const file of ['index.html', 'atlas.html', 'community.html', 'daily.html', 'offline.html', 'region-player.html', 'seals.html', 'synthesis.html']) {
  const source = fs.readFileSync(new URL(file, root), 'utf8');
  for (const locale of ['en', 'fr', 'sv']) if (!new RegExp(`<option[^>]+value=["']${locale}["']`, 'i').test(source)) errors.push(`${file}: language selector is missing ${locale}`);
}

const accessibility = fs.readFileSync(new URL('../accessibility.js', import.meta.url), 'utf8');
for (const locale of ['en', 'fr', 'sv']) if (!new RegExp(`\\b${locale}\\s*:`).test(accessibility)) errors.push(`accessibility.js: shared copy is missing ${locale}`);

if (errors.length) throw new Error(`Localization audit failed:\n${errors.join('\n')}`);
console.log(`Localization audit passed: ${sourceFiles.length} source files are clean and all primary routes expose EN, FR, and SV.`);
