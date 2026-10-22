import { readdirSync, readFileSync } from 'node:fs';
import { ROUTES } from '../../src/site.config.mjs';
import { FILTERS, slugOf, numOf, articlePath } from '../../src/lib/articles.mjs';
export const DESIGN_PAGES = ['Home', 'Plattform', 'Loesungen-Bestandshalter', 'Loesungen-Property', 'Loesungen-Filialisten', 'KI-Teams', 'Trust-Center', 'Ressourcen', 'Unternehmen', 'Gespraech'];
export const LEGAL_PAGES = ['Impressum', 'Datenschutz', 'AGB'];
// alt: the other language's URL, og: the preview image (default /og/<lang>-<page>.png)
export const ALL = [];
for (const lang of ['de', 'en']) for (const page of [...DESIGN_PAGES, ...LEGAL_PAGES]) ALL.push({ page, lang, path: ROUTES[page][lang], alt: ROUTES[page][lang === 'de' ? 'en' : 'de'] });

// Ressourcen filter pages and article pages (files with text below the frontmatter).
const files = (lang) => readdirSync(`src/content/ressourcen/${lang}`).map((f) => ({ f, src: readFileSync(`src/content/ressourcen/${lang}/${f}`, 'utf8') }));
export const ARTICLES = [];
for (const { f, src } of files('de')) {
  if (!/^---\n[\s\S]*?\n---\n?\s*\S/.test(src)) continue;
  const en = files('en').find((x) => numOf(x.f) === numOf(f)).f;
  const de = { lang: 'de', slug: slugOf(f) }, e = { lang: 'en', slug: slugOf(en) };
  for (const [a, b] of [[de, e], [e, de]]) ARTICLES.push({ page: 'Ressourcen-' + a.slug, lang: a.lang, path: articlePath(a.lang, a.slug), alt: articlePath(b.lang, b.slug), og: `/og/${a.lang}-ressourcen-${a.slug}.png` });
}
export const FILTER_PAGES = [];
FILTERS('de').forEach((d, i) => {
  const e = FILTERS('en')[i];
  const de = ROUTES.Ressourcen.de + d.slug + '/', en = ROUTES.Ressourcen.en + e.slug + '/';
  FILTER_PAGES.push({ page: 'Ressourcen-' + d.slug, lang: 'de', path: de, alt: en, og: '/og/de-Ressourcen.png', cat: d.cat });
  FILTER_PAGES.push({ page: 'Ressourcen-' + e.slug, lang: 'en', path: en, alt: de, og: '/og/en-Ressourcen.png', cat: e.cat });
});
ALL.push(...ARTICLES, ...FILTER_PAGES);
