// French exists for the homepage only. The switcher offers FR next to the existing switch on the DE and EN
// homepage, never on another page (no dead link), and the French page links to the English pages.
import { test, expect } from '@playwright/test';
import { ROUTES } from '../../src/site.config.mjs';

const SITE = 'https://www.clearlea.se';

test('DE and EN homepage offer FR, the French homepage offers DE and EN', async ({ page }) => {
  for (const [path, own, targets] of [[ROUTES.Home.de, 'de', ['fr', 'en']], [ROUTES.Home.en, 'en', ['fr', 'de']], [ROUTES.Home.fr, 'fr', ['de', 'en']]]) {
    await page.goto(path);
    for (const l of targets) {
      const link = page.locator(`a[hreflang="${l}"]`).first();
      await expect(link, `${path} -> ${l}`).toHaveAttribute('href', ROUTES.Home[l]);
      await expect(link).toHaveAttribute('lang', l);
    }
    await expect(page.locator(`a[hreflang="${own}"]`), `${path} links to itself`).toHaveCount(0);
  }
});

test('no other page links to FR or declares a French alternate', async ({ page }) => {
  for (const key of Object.keys(ROUTES)) {
    if (key === 'Home' || key === 'NotFound') continue;
    for (const lang of ['de', 'en']) {
      await page.goto(ROUTES[key][lang]);
      await expect(page.locator('a[href^="/fr"]'), `${key} ${lang}`).toHaveCount(0);
      await expect(page.locator('link[rel=alternate][hreflang=fr]'), `${key} ${lang}`).toHaveCount(0);
    }
  }
});

test('French homepage: hreflang, metadata, links go to the English pages', async ({ page, request }) => {
  await page.goto(ROUTES.Home.fr);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  for (const l of ['de', 'en', 'fr']) {
    await expect(page.locator(`link[rel=alternate][hreflang=${l}]`)).toHaveAttribute('href', SITE + ROUTES.Home[l]);
  }
  await expect(page.locator('link[rel=alternate][hreflang=x-default]')).toHaveAttribute('href', SITE + '/');
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
  const internal = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  const allowed = new Set(['/', '/fr/', '/agent.md']);
  const stray = internal.filter((h) => !allowed.has(h) && !h.startsWith('/en/'));
  expect(stray, 'French page links to German pages').toEqual([]);
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain(`hreflang="fr" href="${SITE}/fr/"`);
  expect(sitemap.match(/hreflang="fr"/g).length).toBe(3); // the three homepage versions, nothing else
});
