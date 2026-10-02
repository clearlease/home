// Build-time content helpers used by the generated pages.
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import { getCollection } from 'astro:content';
import { route } from '../site.config.mjs';

const today = () => process.env.SITE_BUILD_DATE || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
const slugOf = (id) => id.split('/').pop().replace(/^\d+-/, '');

// Ressourcen items for one language, in `order`, without expired ones.
export async function ressourcenItems(lang) {
  const all = await getCollection('ressourcen', (e) => e.id.startsWith(lang + '/'));
  return all
    .filter((e) => !e.data.until || today() <= e.data.until)
    .sort((a, b) => a.data.order - b.data.order)
    .map((e) => ({
      cat: e.data.cat,
      title: e.data.title,
      text: e.data.text,
      neu: e.data.neu,
      // an item with a body gets its own article page; otherwise the card links to `href`
      href: e.body && e.body.trim() ? `${route('Ressourcen', lang)}${slugOf(e.id)}/` : e.data.href,
    }));
}

export async function ressourcenArticles(lang) {
  const all = await getCollection('ressourcen', (e) => e.id.startsWith(lang + '/') && !!(e.body && e.body.trim()));
  return all.filter((e) => !e.data.until || today() <= e.data.until).map((e) => ({ slug: slugOf(e.id), entry: e }));
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
