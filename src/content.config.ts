import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One Markdown file per Ressourcen item, per language: src/content/ressourcen/<lang>/<nn>-<slug>.md
// Frontmatter drives the card on /ressourcen. A body below the frontmatter is optional; when a
// file has one, the item gets its own article page (/ressourcen/<slug>) and the card links there.
// `until: YYYY-MM-DD` hides the item after that day (the daily build picks it up).
const ressourcen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ressourcen' }),
  schema: z.object({
    order: z.number(),
    cat: z.enum(['News', 'Produkt-Updates', 'Werkzeuge', 'Ratgeber', 'Webinare', 'Product updates', 'Tools', 'Guides', 'Webinars']),
    title: z.string(),
    text: z.string(),
    neu: z.boolean().default(false),
    href: z.string().optional(),
    date: z.string().optional(),
    until: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { ressourcen };
