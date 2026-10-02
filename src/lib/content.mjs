// Build-time content helpers used by the generated pages.
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import { getCollection } from 'astro:content';
import { buildDay as today } from '../site.config.mjs';

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
      // Article pages are not built yet (planned): a body below the frontmatter is ignored.
      href: e.data.href,
    }));
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
