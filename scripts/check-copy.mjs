// Copy fidelity: every text line of each design (src/designs/<lang>/<Page>.dc.html, as rendered
// by the compiler) must appear in the built page in dist/. Run after `npm run build`.
// Usage: node scripts/check-copy.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { ROUTES } from '../src/site.config.mjs';
import { textOf } from './lib/html.mjs';

const PAGES = ['Home', 'Plattform', 'Loesungen-Bestandshalter', 'Loesungen-Property', 'Loesungen-Filialisten', 'KI-Teams', 'Trust-Center', 'Ressourcen', 'Unternehmen', 'Gespraech'];
const flat = (html) => textOf(html).replace(/\s+/g, ' ');
let failed = 0;
for (const lang of ['de', 'en']) {
  for (const page of PAGES) {
    if (!existsSync(`src/designs/${lang}/${page}.dc.html`)) continue;
    const r = ROUTES[page][lang];
    const built = 'dist' + r + 'index.html';
    if (!existsSync(built)) { console.log(`MISSING  ${lang} ${page}: ${built}`); failed++; continue; }
    const designHtml = execFileSync('node', ['scripts/render-design.mjs', lang, page, '--html'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
    const want = flat(designHtml).trim();
    // The Cal.com slot renders a loading fallback that is not part of the design.
    const text = flat(readFileSync(built, 'utf8')).replace(/ (Kalender wird geladen …|Loading the calendar …) (Freie Termine auf cal\.com ansehen|See free slots on cal\.com)/g, '');
    // The Ressourcen feed comes from Markdown at build time, so compare that page up to the feed.
    const cut = page === 'Ressourcen' ? want.slice(0, Math.max(0, want.indexOf(lang === 'de' ? 'Alle' : 'All'))) : want;
    if (!text.includes(cut.trim())) {
      failed++;
      let i = 0; const start = text.indexOf(cut.slice(0, 40));
      const t = start >= 0 ? text.slice(start) : text;
      while (i < cut.length && cut[i] === t[i]) i++;
      console.log(`FAIL     ${lang} ${page}: text differs at char ${i}\n  design: …${cut.slice(Math.max(0, i - 80), i + 120)}…\n  built:  …${t.slice(Math.max(0, i - 80), i + 120)}…`);
      continue;
    }
    else console.log(`OK       ${lang} ${page} (${cut.length} chars)`);
  }
}
process.exit(failed ? 1 : 0);
