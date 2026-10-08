// Checks that every English design (src/designs/en/*.dc.html) is a pure translation of its
// German source: same elements, same attributes and styles, same script logic. Only text,
// translatable attributes (alt, aria-label, title, placeholder, data-label for phone table headings)
// and string literals may differ.
// Usage: node scripts/check-i18n.mjs [Page]     Exit code 1 on any structural difference.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse } from 'parse5';
import { stripComments, textOf } from './lib/html.mjs';

const TRANSLATABLE = new Set(['alt', 'aria-label', 'title', 'placeholder', 'aria-roledescription', 'data-label']);
const only = process.argv[2];
const pages = readdirSync('src/designs/de').filter((f) => f.endsWith('.dc.html') && f !== 'Shell.dc.html').map((f) => f.replace('.dc.html', ''));
let failed = 0;

const strip = (js) =>
  js
    .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, 'S')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();

function elements(node) {
  return (node.childNodes || []).filter((n) => n.tagName);
}

function compare(a, b, path, errs) {
  if (a.tagName !== b.tagName) { errs.push(`${path}: <${a.tagName}> vs <${b.tagName}>`); return; }
  const aa = Object.fromEntries((a.attrs || []).map((x) => [x.name, x.value]));
  const bb = Object.fromEntries((b.attrs || []).map((x) => [x.name, x.value]));
  for (const k of new Set([...Object.keys(aa), ...Object.keys(bb)])) {
    if (!(k in aa) || !(k in bb)) { errs.push(`${path}: attribute "${k}" only in ${k in aa ? 'DE' : 'EN'}`); continue; }
    if (TRANSLATABLE.has(k) || aa[k] === bb[k] || (k === 'lang' && a.tagName === 'html')) continue;
    if (k === 'href' && aa[k] === '/en' && bb[k] === '/de') continue;
    if (k === 'data-props') { if (JSON.stringify(JSON.parse(aa[k])) === JSON.stringify(JSON.parse(bb[k]))) continue; }
    errs.push(`${path}: ${k}="${aa[k].slice(0, 80)}" vs "${bb[k].slice(0, 80)}"`);
  }
  if (a.tagName === 'script' && aa['data-dc-script'] !== undefined) {
    const ja = strip(a.childNodes.map((n) => n.value).join(''));
    const jb = strip(b.childNodes.map((n) => n.value).join(''));
    if (ja !== jb) {
      let i = 0; while (i < ja.length && ja[i] === jb[i]) i++;
      errs.push(`${path}: script logic differs near: DE "…${ja.slice(Math.max(0, i - 60), i + 60)}…" / EN "…${jb.slice(Math.max(0, i - 60), i + 60)}…"`);
    }
    return;
  }
  if (a.tagName === 'style') {
    const t = (n) => n.childNodes.map((c) => c.value).join('').replace(/\s+/g, ' ');
    if (t(a) !== t(b)) errs.push(`${path}: <style> differs`);
    return;
  }
  const ea = elements(a), eb = elements(b);
  if (ea.length !== eb.length) { errs.push(`${path}: ${ea.length} child elements vs ${eb.length}`); return; }
  ea.forEach((c, i) => compare(c, eb[i], `${path}>${c.tagName}[${i}]`, errs));
}

for (const p of pages) {
  if (only && p !== only) continue;
  const en = `src/designs/en/${p}.dc.html`;
  if (!existsSync(en)) { console.log(`MISSING  ${p}`); failed++; continue; }
  const errs = [];
  const de = readFileSync(`src/designs/de/${p}.dc.html`, 'utf8');
  const enSrc = readFileSync(en, 'utf8');
  compare(parse(de), parse(enSrc), p, errs);
  if (!/<html lang="en"/.test(enSrc)) errs.push('<html lang="en"> missing');
  const noComments = stripComments(enSrc);
  if (/ — | – /.test(noComments)) errs.push('dash with spaces found (brand voice: no em or en dashes as punctuation)');
  if (/Clearlea\.se|ClearLease|Clearlease(?!-)/.test(noComments.replace(/clearlease[-_]/gi, ''))) errs.push('brand spelling: use "clearlea.se"');
  // German words that should not survive a translation (outside comments, URLs and names)
  const visible = textOf(enSrc, { keep: new Set(['script']) });
  const leftovers = (visible.match(/\b(und|oder|nicht|Ihre?n?|Sie|wir|mit|für|der|die|das|ein|eine|ist|sind|wird|Gespräch|Vertrag|Verträge|Nachtrag)\b/g) || []);
  if (leftovers.length > 12) errs.push(`possible untranslated German (${leftovers.length} hits, e.g. ${[...new Set(leftovers)].slice(0, 8).join(', ')})`);
  if (errs.length) { failed++; console.log(`FAIL     ${p}\n  - ${errs.slice(0, 25).join('\n  - ')}${errs.length > 25 ? `\n  … ${errs.length - 25} more` : ''}`); }
  else console.log(`OK       ${p}`);
}
process.exit(failed ? 1 : 0);
