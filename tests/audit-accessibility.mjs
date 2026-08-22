import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

for (const file of pages) {
  const html = fs.readFileSync(new URL(file, root), 'utf8');
  if (!/<html[^>]+lang=["'][a-z]{2}(?:-[A-Z]{2})?["']/i.test(html)) fail(file, 'missing a valid document language');
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(file, 'missing a non-empty title');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) fail(file, 'missing viewport metadata');
  if (!/<main\b/i.test(html)) fail(file, 'missing the main landmark');
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) if (!/\balt\s*=/i.test(match[1])) fail(file, 'image is missing alt text');
  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    if (/target=["']_blank["']/i.test(match[1]) && !/rel=["'][^"']*noopener/i.test(match[1])) fail(file, 'new-window link is missing rel="noopener"');
  }
  for (const match of html.matchAll(/tabindex=["'](\d+)["']/gi)) if (Number(match[1]) > 0) fail(file, 'positive tabindex disrupts keyboard order');
  const shared = /resilience\.js/i.test(html) || file === 'seals.html';
  if (!shared && file !== 'offline.html') fail(file, 'shared accessibility layer is not loaded');
}

const css = fs.readFileSync(new URL('../accessibility.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../accessibility.js', import.meta.url), 'utf8');
if (!/:focus-visible/.test(css)) fail('accessibility.css', 'missing visible keyboard focus');
if (!/prefers-reduced-motion/.test(css)) fail('accessibility.css', 'missing reduced-motion support');
if (!/skip-link/.test(js) || !/aria-labelledby/.test(js) || !/aria-modal/.test(js)) fail('accessibility.js', 'missing landmark or dialog support');

if (errors.length) throw new Error(`Accessibility audit failed:\n${errors.join('\n')}`);
console.log(`Accessibility audit passed: ${pages.length} routes plus shared keyboard, motion, control, and dialog behavior.`);
