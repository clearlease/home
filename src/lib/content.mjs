// Build-time content helpers used by the generated pages.
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import { getCollection } from 'astro:content';
import { buildDay as today } from '../site.config.mjs';
import { isLive } from './expiry.mjs';
import { validate, sortItems, hasBody, slugOf, numOf, articlePath, filterPath, resolveHref, pairByNumber } from './articles.mjs';

// All Ressourcen files, checked once per build: a broken item stops the build with every problem listed.
let checked;
async function allEntries() {
  if (!checked) {
    const all = await getCollection('ressourcen');
    const errors = validate(all);
    if (errors.length) throw new Error('Ressourcen content:\n  ' + errors.join('\n  '));
    checked = all;
  }
  return checked;
}
const ofLang = (all, lang) => all.filter((e) => e.id.startsWith(lang + '/'));
const live = (e) => isLive({ until: e.data.until }, today(), `ressourcen/${e.id}`);

// Ressourcen items for one language, newest first, without expired ones.
// An item with article text links to its own page, the others to their `href`.
export async function ressourcenItems(lang) {
  return sortItems(ofLang(await allEntries(), lang).filter(live)).map((e) => ({
    cat: e.data.cat,
    title: e.data.title,
    text: e.data.text,
    neu: e.data.neu,
    date: e.data.date,
    href: hasBody(e) ? articlePath(lang, slugOf(e.id)) : e.data.href,
  }));
}

const dayLabel = (day, lang) => new Date(day + 'T12:00:00Z').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Article pages for one language. Expired articles keep their page (shared links stay valid);
// they only leave the list and the feed.
export async function ressourcenArticles(lang) {
  const all = await allEntries();
  const twins = pairByNumber(all);
  const other = lang === 'de' ? 'en' : 'de';
  return ofLang(all, lang).filter(hasBody).map((e) => ({
    slug: slugOf(e.id),
    path: articlePath(lang, slugOf(e.id)),
    altPath: articlePath(other, slugOf(twins.get(numOf(e.id))[other].id)),
    cat: e.data.cat,
    catPath: filterPath(lang, e.data.cat),
    title: e.data.title,
    text: e.data.text,
    date: e.data.date,
    dateLabel: dayLabel(e.data.date, lang),
    html: marked.parse(e.body),
    moreHref: resolveHref(lang, e.data.href),
  }));
}

// Feed entries (all live items, list order) with absolute links.
export async function ressourcenFeedItems(lang) {
  return (await ressourcenItems(lang)).map((it) => ({ ...it, link: resolveHref(lang, it.href, { absolute: true }) }));
}


// Legal texts: the existing Markdown files, rendered at build time (German only).
const LEGAL_FILES = {
  Impressum: 'resources/content/20250911 - clearlease - inprint.md',
  Datenschutz: 'resources/content/20250911 - clearlease - privacy.md',
  AGB: 'resources/content/20250616 - 0938uhr - clearlease - terms.md',
};
export function legalHtml(key) {
  return marked.parse(readFileSync(LEGAL_FILES[key], 'utf8'));
}
