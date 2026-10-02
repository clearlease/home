// Builds a side-by-side German/English review page from the designs. Because both files share
// the same markup, text blocks pair up exactly by position. Script strings pair up in order.
// Usage: node scripts/translation-review.mjs <out.html> [notes.json]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'parse5';

const PAGES = [
  ['Home', 'Startseite'], ['Plattform', 'Plattform'], ['Loesungen-Bestandshalter', 'Lösungen · Bestandshalter'],
  ['Loesungen-Property', 'Lösungen · Property & FM'], ['Loesungen-Filialisten', 'Lösungen · Filialisten'],
  ['KI-Teams', 'Für KI- & IT-Teams'], ['Trust-Center', 'Trust Center'], ['Ressourcen', 'Ressourcen'],
  ['Unternehmen', 'Unternehmen'], ['Gespraech', 'Gespräch'],
];
const INLINE = new Set(['span', 'a', 'strong', 'b', 'em', 'i', 'br', 'sup', 'sub', 'small', 'code', 'abbr']);
const SKIP = new Set(['script', 'style', 'svg', 'helmet', 'head', 'title']);
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const text = (n) => (n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join(''));
const els = (n) => (n.childNodes || []).filter((c) => c.tagName);
const isTextBlock = (n) => {
  const own = (n.childNodes || []).some((c) => c.nodeName === '#text' && c.value.trim());
  const allInline = (function deep(m) { return els(m).every((c) => INLINE.has(c.tagName) && deep(c)); })(n);
  return own && allInline;
};
const hasHole = (s) => s.includes('{{');

function pairs(a, b, out, where = '') {
  if (!a.tagName) { const ea = els(a), eb = els(b); ea.forEach((c, i) => eb[i] && pairs(c, eb[i], out, where)); return; }
  if (SKIP.has(a.tagName)) return;
  if (a.tagName === 'header' || a.tagName === 'footer') where = a.tagName;
  if (isTextBlock(a)) {
    const de = norm(text(a)), en = norm(text(b));
    if (de && !hasHole(de)) out.push({ de, en, where });
    return;
  }
  const ea = els(a), eb = els(b);
  ea.forEach((c, i) => eb[i] && pairs(c, eb[i], out, where));
}

const strings = (src) => {
  const m = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
  return m ? [...m[1].matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)].map((x) => x[1] ?? x[2]) : [];
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const seen = new Set();
let total = 0;
const sections = [];
for (const [page, label] of PAGES) {
  const deSrc = readFileSync(`src/designs/de/${page}.dc.html`, 'utf8');
  const enSrc = readFileSync(`src/designs/en/${page}.dc.html`, 'utf8');
  const rows = [];
  pairs(parse(deSrc), parse(enSrc), rows);
  const sd = strings(deSrc), se = strings(enSrc);
  sd.forEach((s, i) => { if (s !== se[i] && /[A-Za-zÄÖÜäöüß]{2}/.test(s) && !/^[\w.-]+\.(pdf|csv)$/.test(s)) rows.push({ de: s, en: se[i] ?? '', where: 'demo' }); });
  const fresh = rows.filter((r) => { const k = r.de + '|' + r.en; if (seen.has(k)) return false; seen.add(k); return r.de !== r.en; });
  total += fresh.length;
  sections.push({ page, label, rows: fresh });
}

const notes = process.argv[3] && existsSync(process.argv[3]) ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : [];
const tag = { header: 'Navigation', footer: 'Footer', demo: 'Product demo' };
const html = `<title>clearlea.se English Copy</title>
<style>
:root{--bg:#f7f7f7;--surface:#ffffff;--warm:#e7e5df;--fg:#13293d;--fg2:#43586c;--fg3:#55636f;--line:rgba(0,0,0,.12);--teal:#1d6485;--tealbg:#eff6fa;--warn:#84410d;--warnbg:#fdf0e3;
--display:"Montserrat",system-ui,-apple-system,"Segoe UI",sans-serif;--body:"Montserrat",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0d1c2a;--surface:#13293d;--warm:#1b3349;--fg:#eef2f5;--fg2:#c3ccd4;--fg3:#a4b0bb;--line:rgba(255,255,255,.14);--teal:#8cc4dd;--tealbg:#16384f;--warn:#f3b27a;--warnbg:#3a2614;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0d1c2a;--surface:#13293d;--warm:#1b3349;--fg:#eef2f5;--fg2:#c3ccd4;--fg3:#a4b0bb;--line:rgba(255,255,255,.14);--teal:#8cc4dd;--tealbg:#16384f;--warn:#f3b27a;--warnbg:#3a2614;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:15px;line-height:1.55;padding-inline:16px;padding-block:0 64px}
.wrap{max-width:1180px;margin:0 auto}
header.top{padding-block:48px 24px;display:flex;flex-direction:column;gap:12px}
.kicker{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--teal)}
.kicker::before{content:"";width:7px;height:7px;border-radius:9999px;background:var(--fg)}
h1{margin:0;font-family:var(--display);font-size:clamp(2rem,4.5vw,3.25rem);line-height:1.05;letter-spacing:-.035em;font-weight:700;text-wrap:balance}
.lede{margin:0;max-width:68ch;color:var(--fg2);font-size:17px}
nav.toc{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);padding-block:12px;border-bottom:1px solid var(--line);display:flex;gap:8px;overflow-x:auto}
nav.toc a{flex-shrink:0;font-size:13px;font-weight:600;color:var(--fg);text-decoration:none;padding:6px 12px;border-radius:9999px;background:var(--surface);border:1px solid var(--line)}
nav.toc a:hover,nav.toc a:focus-visible{border-color:var(--fg)}
.notes{margin-block:32px;background:var(--warnbg);border-radius:12px;padding:20px 24px}
.notes h2{margin:0 0 8px;font-size:18px;color:var(--warn)}
.notes ul{margin:0;padding-left:20px;display:grid;gap:6px;color:var(--fg)}
section.page{margin-top:48px;scroll-margin-top:72px}
section.page h2{font-family:var(--display);font-size:26px;letter-spacing:-.015em;margin:0 0 4px;font-weight:600}
.count{font-size:13px;color:var(--fg3);margin:0 0 16px}
.table{background:var(--surface);border-radius:12px;overflow:hidden}
.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border-top:1px solid var(--line)}
.row:first-child{border-top:0}
.row.head{background:var(--warm);font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--fg2)}
.cell{padding:10px 16px;min-width:0;overflow-wrap:anywhere}
.cell+.cell{border-left:1px solid var(--line)}
.tag{display:inline-block;margin-right:8px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--teal);background:var(--tealbg);border-radius:9999px;padding:1px 8px;vertical-align:1px}
@media (max-width:640px){.row{grid-template-columns:1fr}.cell+.cell{border-left:0;border-top:1px dashed var(--line)}.row.head{display:none}.cell:first-child{color:var(--fg3);font-size:13px}}
a:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
</style>
<div class="wrap">
<header class="top">
<span class="kicker">Website v1 · English version</span>
<h1>English copy for review</h1>
<p class="lede">Every text on the ten pages, German original on the left and the English translation on the right, in page order. Texts that repeat across pages, such as navigation and footer, appear once. Approve, or note the line you want changed.</p>
<p class="lede" style="font-size:14px;color:var(--fg3)">${total} text pairs · generated from the build source</p>
</header>
<nav class="toc" aria-label="Pages">${sections.map((s) => `<a href="#${s.page}">${esc(s.label)}</a>`).join('')}</nav>
${notes.length ? `<div class="notes"><h2>Wording decisions to confirm</h2><ul>${notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
${sections.map((s) => `<section class="page" id="${s.page}"><h2>${esc(s.label)}</h2><p class="count">${s.rows.length} texts</p>
<div class="table"><div class="row head"><div class="cell">Deutsch</div><div class="cell">English</div></div>
${s.rows.map((r) => `<div class="row"><div class="cell" lang="de">${r.where ? `<span class="tag">${tag[r.where]}</span>` : ''}${esc(r.de)}</div><div class="cell" lang="en">${esc(r.en)}</div></div>`).join('\n')}
</div></section>`).join('\n')}
</div>`;
writeFileSync(process.argv[2], html);
console.log(process.argv[2], total, 'pairs', Math.round(html.length / 1024) + ' KB');
