// No dead links: every internal link and in-page anchor on every page resolves. No placeholders.
import { test, expect } from '@playwright/test';
import { ALL } from './routes.mjs';

test('all internal links and anchors resolve, no placeholder links', async ({ page, request }) => {
  test.setTimeout(180_000);
  const checked = new Map();
  const problems = [];
  for (const { path } of ALL) {
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const href of new Set(hrefs)) {
      if (/^\[.*\]$/.test(href)) { problems.push(`${path}: placeholder link ${href}`); continue; }
      if (/^(mailto:|tel:|https?:)/.test(href) && !href.startsWith('https://www.clearlea.se')) continue;
      const url = new URL(href, page.url());
      const key = url.pathname;
      if (!checked.has(key)) checked.set(key, (await request.get(key)).status());
      if (checked.get(key) !== 200) problems.push(`${path}: ${href} -> ${checked.get(key)}`);
      if (url.hash && url.hash.length > 1) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (url.pathname === new URL(page.url()).pathname) {
          if (!(await page.locator(`[id="${id}"]`).count())) problems.push(`${path}: anchor ${href} has no target`);
        } else {
          const html = await (await request.get(key)).text();
          if (!html.includes(`id="${id}"`)) problems.push(`${path}: anchor ${href} has no target on ${key}`);
        }
      }
    }
  }
  expect(problems).toEqual([]);
});

test('every visible e-mail address is a mailto link to that address', async ({ page }) => {
  test.setTimeout(180_000);
  const problems = [];
  for (const { path } of ALL) {
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
    problems.push(...(await page.evaluate((p) => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) {
        if (n.parentElement.closest('script, style')) continue;
        for (const m of n.data.matchAll(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi)) {
          const href = n.parentElement.closest('a')?.getAttribute('href') || '';
          if (!href.startsWith('mailto:' + m[0])) out.push(`${p}: ${m[0]} is not a mailto link`);
        }
      }
      return out;
    }, path)));
  }
  expect(problems).toEqual([]);
});
