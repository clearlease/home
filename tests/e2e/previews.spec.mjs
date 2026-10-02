// Link previews and search snippets: every page has a short description, its own preview
// image (that actually loads), Twitter/X tags and valid structured data.
import { test, expect } from '@playwright/test';
import { ALL, LEGAL_PAGES } from './routes.mjs';

test('link-preview metadata on every page', async ({ page, request }) => {
  const problems = [];
  for (const { page: name, lang, path } of ALL) {
    await page.goto(path);
    const meta = (sel) => page.evaluate((q) => document.querySelector(q)?.getAttribute('content') ?? null, sel);
    const desc = await meta('meta[name=description]');
    const img = await meta('meta[property="og:image"]');
    if (!desc || desc.length > 160) problems.push(`${path}: description ${desc ? desc.length + ' chars' : 'missing'}`);
    if (!LEGAL_PAGES.includes(name)) {
      if (!img?.endsWith(`/og/${lang}-${name}.png`)) problems.push(`${path}: og:image ${img}`);
    }
    const local = new URL(img).pathname;
    const res = await request.get(local);
    if (res.status() !== 200 || !(res.headers()['content-type'] || '').includes('image/png')) problems.push(`${path}: ${local} -> ${res.status()}`);
    for (const sel of ['meta[property="og:title"]', 'meta[property="og:image:alt"]', 'meta[name="twitter:card"]', 'meta[name="twitter:image"]']) {
      if (!(await meta(sel))) problems.push(`${path}: ${sel} missing`);
    }
    for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      try { JSON.parse(json); } catch { problems.push(`${path}: invalid JSON-LD`); }
    }
  }
  expect(problems).toEqual([]);
});
