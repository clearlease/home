import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import dcPages from './src/dc/vite-plugin.mjs';
import { SITE_URL, ROUTES } from './src/site.config.mjs';

// hreflang pairs for the sitemap: DE and EN slugs differ, so pair them from the route map.
const pairs = new Map();
for (const r of Object.values(ROUTES)) {
  const de = SITE_URL + r.de;
  const en = SITE_URL + r.en;
  const links = [{ lang: 'de', url: de }, { lang: 'en', url: en }];
  pairs.set(de, links);
  pairs.set(en, links);
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    preact(),
    sitemap({
      serialize(item) {
        const links = pairs.get(item.url);
        return links ? { ...item, links } : item;
      },
    }),
  ],
  vite: { plugins: [dcPages()] },
});
