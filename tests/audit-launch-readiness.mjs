import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url),pages=['index.html','atlas.html','community.html','daily.html','passport.html','region-player.html','seals.html','synthesis.html'];
const assert=(value,message)=>{if(!value)throw new Error(message)};
for(const page of pages){const html=await readFile(new URL(page,root),'utf8');for(const marker of ['name="description"','rel="canonical"','property="og:title"','property="og:description"','property="og:image"','name="twitter:card"'])assert(html.includes(marker),`${page} missing ${marker}`)}
const robots=await readFile(new URL('robots.txt',root),'utf8'),sitemap=await readFile(new URL('sitemap.xml',root),'utf8'),manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
assert(robots.includes('https://atlas.nuhar.se/sitemap.xml'),'robots.txt missing sitemap');assert(sitemap.includes('https://atlas.nuhar.se/'),'sitemap missing canonical origin');assert(manifest.id==='/'&&manifest.lang==='en','manifest missing stable identity or language');
console.log(`Launch readiness passed: ${pages.length} discoverable routes · canonical social previews · robots · sitemap · install identity.`);
