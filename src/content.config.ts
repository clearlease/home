import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One Markdown file per Ressourcen item, per language: src/content/ressourcen/<lang>/<nn>-<slug>.md
// Frontmatter drives the card on /ressourcen. Text below the frontmatter makes the item an article
// with its own page (/ressourcen/<slug>/), and the card links there; without text the card links to `href`.
// Rules and checks: src/lib/articles.mjs, docs/ressourcen.md.
// `until: YYYY-MM-DD` hides the item after that day (the daily build picks it up).
const day = z.union([z.string(), z.date().transform((d) => d.toISOString().slice(0, 10))])
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'use YYYY-MM-DD');

const ressourcen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ressourcen' }),
  schema: z.object({
    order: z.number().optional(), // undated items sort by it; dated items sort newest first
    cat: z.enum(['News', 'Produkt-Updates', 'Werkzeuge', 'Ratgeber', 'Webinare', 'Product updates', 'Tools', 'Guides', 'Webinars']),
    title: z.string(),
    text: z.string(),
    neu: z.boolean().default(false),
    href: z.string().optional(),
    // quoted or not: YAML reads an unquoted 2026-10-07 as a Date
    date: day.optional(), // publication day, required for articles
    until: day.optional(),
    image: z.string().optional(),
  }),
});

export const collections = { ressourcen };
