// Every page, both languages, every viewport project: loads, one H1, metadata, no overflow, no errors.
import { test, expect } from '@playwright/test';
import { ALL, LEGAL_PAGES } from './routes.mjs';
import { ROUTES } from '../../src/site.config.mjs';

for (const { page, lang, path } of ALL) {
  test(`${lang} ${page} (${path})`, async ({ page: p }) => {
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/cal\.com|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const res = await p.goto(path);
    expect(res.status()).toBe(200);
    await expect(p.locator('html')).toHaveAttribute('lang', lang);
    await p.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
    // one H1 in the document (Cal.com's widget brings its own inside a shadow root)
    if (!LEGAL_PAGES.includes(page)) expect(await p.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
    await expect(p).toHaveTitle(/clearlea\.se/);
    const canonical = await p.locator('link[rel=canonical]').getAttribute('href');
    expect(canonical).toBe('https://www.clearlea.se' + path);
    const other = lang === 'de' ? 'en' : 'de';
    expect(await p.locator(`link[rel=alternate][hreflang=${other}]`).getAttribute('href')).toBe('https://www.clearlea.se' + ROUTES[page][other]);
    if (!LEGAL_PAGES.includes(page)) expect(await p.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
    // no horizontal scrolling at any viewport
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'page is wider than the viewport').toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}
