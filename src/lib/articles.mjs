// Ressourcen articles: pairing, paths and checks. No Astro imports, so vitest and
// astro.config.mjs can load it. The build-time loader is src/lib/content.mjs.
//
// One item = one Markdown file per language, src/content/ressourcen/<lang>/<nn>-<slug>.md.
// The same <nn> pairs the German and the English file; <slug> becomes the URL.
// A file with text below the frontmatter is an article with a page of its own.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { marked } from 'marked';
import { SITE_URL, ROUTES, route } from '../site.config.mjs';

// Categories in tab order, German and English at the same index. The first three have filter pages.
export const CATS = {
  de: ['News', 'Produkt-Updates', 'Werkzeuge', 'Ratgeber', 'Webinare'],
  en: ['News', 'Product updates', 'Tools', 'Guides', 'Webinars'],
};
const CAT_SLUGS = { de: ['news', 'produkt-updates', 'werkzeuge'], en: ['news', 'product-updates', 'tools'] };
export const FILTERS = (lang) => CAT_SLUGS[lang].map((slug, i) => ({ slug, cat: CATS[lang][i] }));
// Tab label -> URL, for the tabs on /ressourcen/ (the first tab shows everything).
export const filterUrls = (lang) => Object.fromEntries([[lang === 'de' ? 'Alle' : 'All', route('Ressourcen', lang)], ...FILTERS(lang).map((f) => [f.cat, filterPath(lang, f.cat)])]);
export const feedPath = (lang) => route('Ressourcen', lang) + 'feed.xml';
const RESERVED = new Set([...CAT_SLUGS.de, ...CAT_SLUGS.en, 'feed.xml']);

const fileName = (id) => id.split('/').pop().replace(/\.md$/, '');
export const numOf = (id) => fileName(id).match(/^(\d+)-/)?.[1];
export const slugOf = (id) => fileName(id).replace(/^\d+-/, '');
export const langOf = (id) => id.split('/')[0];

export const articlePath = (lang, slug) => route('Ressourcen', lang) + slug + '/';
// Generated brand visual for an article without its own image (scripts/og-images.mjs writes it).
export const visualPath = (lang, slug) => `/og/${lang}-ressourcen-${slug}-visual.png`;
export const filterPath = (lang, cat) => {
  const i = CATS[lang].indexOf(cat);
  return i >= 0 && i < CAT_SLUGS[lang].length ? route('Ressourcen', lang) + CAT_SLUGS[lang][i] + '/' : null;
};

// An item's href as the designs write it: `Page.dc.html#x`, `#x` (on the Ressourcen page), `/path` or https://.
export function resolveHref(lang, href, { absolute = false } = {}) {
  if (!href) return href;
  let out = href;
  const page = href.match(/^([\w-]+)\.dc\.html(#.*)?$/);
  if (page && ROUTES[page[1]]) out = route(page[1], lang) + (page[2] || '');
  else if (href.startsWith('#')) out = route('Ressourcen', lang) + href;
  return absolute && out.startsWith('/') ? SITE_URL + out : out;
}

export const hasBody = (e) => !!(e.body && e.body.trim());

// Newest dated item first, then undated items in `order`.
export function sortItems(entries) {
  return [...entries].sort((a, b) => {
    const da = a.data.date || '', db = b.data.date || '';
    if (da !== db) return da && db ? db.localeCompare(da) : da ? -1 : 1;
    return (a.data.order ?? 0) - (b.data.order ?? 0);
  });
}

// entries: [{ id: 'de/02-slug', data, body }] → Map nn → { de, en }
export function pairByNumber(entries) {
  const pairs = new Map();
  for (const e of entries) {
    const nn = numOf(e.id);
    if (!pairs.has(nn)) pairs.set(nn, {});
    pairs.get(nn)[langOf(e.id)] = e;
  }
  return pairs;
}

// Every problem in the Ressourcen files, as readable lines. Empty = fine.
export function validate(entries) {
  const errors = [];
  const seen = new Set();
  for (const e of entries) {
    if (!/^(de|en)\/\d+-[a-z0-9-]+$/.test(e.id.replace(/\.md$/, ''))) errors.push(`${e.id}: file name must be <nn>-<slug>.md with a-z, 0-9 and dashes`);
    if (seen.has(langOf(e.id) + numOf(e.id))) errors.push(`${e.id}: number ${numOf(e.id)} is used twice in ${langOf(e.id)}/`);
    seen.add(langOf(e.id) + numOf(e.id));
    if (hasBody(e)) {
      if (RESERVED.has(slugOf(e.id))) errors.push(`${e.id}: slug "${slugOf(e.id)}" is reserved for a filter page or the feed`);
      if (!e.data.date) errors.push(`${e.id}: an article (text below the frontmatter) needs date: YYYY-MM-DD`);
      errors.push(...bodyErrors(e));
      if (e.data.image && !e.data.image.endsWith('.png')) errors.push(`${e.id}: article images are PNG (${e.data.image})`);
      else if (e.data.image && !existsSync('public' + e.data.image)) errors.push(`${e.id}: image ${e.data.image} not found in public/`);
      if (e.data.image && !e.data.imageAlt) errors.push(`${e.id}: an image needs imageAlt (what the picture shows)`);
    }
  }
  for (const [nn, { de, en }] of pairByNumber(entries)) {
    if (!de || !en) { errors.push(`${(de || en).id}: no ${de ? 'English' : 'German'} twin with number ${nn}`); continue; }
    if (hasBody(de) !== hasBody(en)) errors.push(`${nn}: only one language has article text (${de.id}, ${en.id})`);
    if (CATS.de.indexOf(de.data.cat) !== CATS.en.indexOf(en.data.cat)) errors.push(`${nn}: categories differ ("${de.data.cat}" vs "${en.data.cat}")`);
    for (const k of ['date', 'until', 'neu']) {
      if ((de.data[k] ?? null) !== (en.data[k] ?? null)) errors.push(`${nn}: ${k} differs between German and English`);
    }
  }
  return errors;
}

// Article text is Markdown only: no raw HTML (pasted LinkedIn or Notion markup), and links
// point to production URLs in the article's own language.
function bodyErrors(e) {
  const errors = [];
  const lang = langOf(e.id);
  marked.walkTokens(marked.lexer(e.body), (t) => {
    if (t.type === 'html') errors.push(`${e.id}: raw HTML is not allowed in article text (${t.raw.trim().slice(0, 40)})`);
    if (t.type !== 'link') return;
    if (/\.dc\.html/.test(t.href)) errors.push(`${e.id}: link "${t.href}" must be a URL like /plattform/, not a design file`);
    else if (lang === 'de' && t.href.startsWith('/en/')) errors.push(`${e.id}: German article links to an English page (${t.href})`);
    else if (lang === 'en' && t.href.startsWith('/') && !t.href.startsWith('/en/')) errors.push(`${e.id}: English article links to a German page (${t.href})`);
  });
  return errors;
}

// `[RESSOURCE-02]` in a design: the article page of item 02 in that language. Throws if
// there is no such file or it has no article text, so a nav link can never point to a 404.
export function articlePathByNumber(lang, nn, dir = 'src/content/ressourcen') {
  const f = readdirSync(`${dir}/${lang}`).find((x) => numOf(x) === nn);
  if (!f) throw new Error(`[RESSOURCE-${nn}]: no file ${dir}/${lang}/${nn}-*.md`);
  if (!/^---\n[\s\S]*?\n---\n?\s*\S/.test(readFileSync(`${dir}/${lang}/${f}`, 'utf8'))) throw new Error(`[RESSOURCE-${nn}]: ${lang}/${f} has no article text`);
  return articlePath(lang, slugOf(f));
}

// Sitemap hreflang pairs from the file names alone (astro.config.mjs cannot read the collection).
export function ressourcenUrlPairs(dir = 'src/content/ressourcen') {
  const byNum = pairByNumber(['de', 'en'].flatMap((l) => readdirSync(`${dir}/${l}`).filter((f) => f.endsWith('.md')).map((f) => ({ id: `${l}/${f}` }))));
  const pairs = [];
  for (const { de, en } of byNum.values()) if (de && en) pairs.push({ de: articlePath('de', slugOf(de.id)), en: articlePath('en', slugOf(en.id)) });
  CAT_SLUGS.de.forEach((s, i) => pairs.push({ de: route('Ressourcen', 'de') + s + '/', en: route('Ressourcen', 'en') + CAT_SLUGS.en[i] + '/' }));
  return pairs;
}

const xml = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const rfc822 = (day) => new Date(day + 'T08:00:00Z').toUTCString();

// RSS 2.0. items: [{ title, text, link (absolute), date? }], already sorted.
export function rssFeed({ title, link, description, lang, self, items }) {
  const entries = items.map((it) => `    <item>
      <title>${xml(it.title)}</title>
      <link>${xml(it.link)}</link>
      <guid>${xml(it.link)}</guid>
      <description>${xml(it.text)}</description>${it.cat ? `\n      <category>${xml(it.cat)}</category>` : ''}${it.date ? `\n      <pubDate>${rfc822(it.date)}</pubDate>` : ''}
    </item>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(link)}</link>
    <description>${xml(description)}</description>
    <language>${lang}</language>
    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml" />
${entries.join('\n')}
  </channel>
</rss>
`;
}
