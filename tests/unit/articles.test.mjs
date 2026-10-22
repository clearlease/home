import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { CATS, FILTERS, slugOf, numOf, articlePath, filterPath, resolveHref, sortItems, validate, ressourcenUrlPairs, rssFeed } from '../../src/lib/articles.mjs';

const item = (id, data = {}, body = '') => ({ id, data: { cat: id.startsWith('de') ? 'News' : 'News', neu: false, ...data }, body });
const pair = (nn, data = {}, deBody = '', enBody = deBody) => [item(`de/${nn}-eins`, data, deBody), item(`en/${nn}-one`, data, enBody)];

describe('paths', () => {
  it('slug and number come from the file name', () => {
    expect(slugOf('de/02-mcp-server')).toBe('mcp-server');
    expect(numOf('en/02-mcp-server.md')).toBe('02');
  });
  it('articles and filters live under the Ressourcen route', () => {
    expect(articlePath('de', 'x')).toBe('/ressourcen/x/');
    expect(articlePath('en', 'x')).toBe('/en/resources/x/');
    expect(filterPath('de', 'Produkt-Updates')).toBe('/ressourcen/produkt-updates/');
    expect(filterPath('en', 'Tools')).toBe('/en/resources/tools/');
    expect(filterPath('de', 'Ratgeber')).toBe(null);
  });
  it('filter labels match the tabs in both designs', () => {
    for (const lang of ['de', 'en']) {
      const src = readFileSync(`src/designs/${lang}/Ressourcen.dc.html`, 'utf8');
      for (const { cat } of FILTERS(lang)) expect(src).toContain(`['${cat}', false]`);
    }
  });
  it('resolves design links, anchors and absolute URLs', () => {
    expect(resolveHref('de', 'Plattform.dc.html#workflows')).toBe('/plattform/#workflows');
    expect(resolveHref('en', 'KI-Teams.dc.html')).toBe('/en/ai-teams/');
    expect(resolveHref('de', '#indexrechner')).toBe('/ressourcen/#indexrechner');
    expect(resolveHref('en', '#indexrechner', { absolute: true })).toBe('https://www.clearlea.se/en/resources/#indexrechner');
    expect(resolveHref('de', 'https://cal.com/x', { absolute: true })).toBe('https://cal.com/x');
  });
});

describe('sortItems', () => {
  it('puts dated items first, newest first, then the rest in order', () => {
    const got = sortItems([item('de/01-a', { order: 1 }), item('de/02-b', { order: 2, date: '2026-01-01' }), item('de/03-c', { order: 3, date: '2026-10-22' }), item('de/04-d', { order: 0 })]);
    expect(got.map((e) => e.id)).toEqual(['de/03-c', 'de/02-b', 'de/04-d', 'de/01-a']);
  });
});

describe('validate', () => {
  it('accepts a clean pair with and without text', () => {
    expect(validate([...pair('01'), ...pair('02', { date: '2026-10-22' }, 'Text.')])).toEqual([]);
  });
  it('finds a missing twin', () => {
    expect(validate([item('de/01-eins')]).join()).toMatch(/no English twin/);
  });
  it('finds text in one language only', () => {
    expect(validate(pair('01', { date: '2026-10-22' }, 'Text.', '')).join()).toMatch(/only one language/);
  });
  it('needs a date on articles', () => {
    expect(validate(pair('01', {}, 'Text.')).join()).toMatch(/needs date/);
  });
  it('refuses reserved slugs and duplicate numbers', () => {
    expect(validate([item('de/01-news', { date: '2026-10-22' }, 'x'), item('en/01-news', { date: '2026-10-22' }, 'x')]).join()).toMatch(/reserved/);
    expect(validate([...pair('01'), item('de/01-zwei')]).join()).toMatch(/used twice/);
  });
  it('compares category, until, neu and date across the pair', () => {
    const [de, en] = pair('01');
    en.data.cat = 'Tools';
    en.data.until = '2026-12-31';
    expect(validate([de, en]).join()).toMatch(/categories differ.*until differs/);
    const [de2, en2] = pair('02');
    de2.data.cat = 'Produkt-Updates'; en2.data.cat = 'Product updates';
    expect(validate([de2, en2])).toEqual([]);
  });
  it('refuses raw HTML, design links and links into the other language', () => {
    const d = { date: '2026-10-22' };
    expect(validate(pair('01', d, 'Hallo <b>fett</b>')).join()).toMatch(/raw HTML/);
    expect(validate(pair('01', d, '[x](Plattform.dc.html)')).join()).toMatch(/design file/);
    expect(validate(pair('01', d, '[x](/en/platform/)', '[x](/en/platform/)')).join()).toMatch(/German article links to an English page/);
    expect(validate(pair('01', d, '[x](/plattform/)', '[x](/plattform/)')).join()).toMatch(/English article links to a German page/);
    expect(validate(pair('01', d, '[x](/plattform/) [y](https://a.b)', '[x](/en/platform/)'))).toEqual([]);
  });
  it('needs an existing file and alt text for an article image', () => {
    const d = { date: '2026-10-22' };
    expect(validate(pair('01', { ...d, image: '/media/nope.png', imageAlt: 'x' }, 'Text.')).join()).toMatch(/not found in public/);
    expect(validate(pair('01', { ...d, image: '/media/clearlease-logo.svg', imageAlt: 'x' }, 'Text.')).join()).toMatch(/are PNG/);
    expect(validate(pair('01', { ...d, image: '/media/clearlease-logo.png' }, 'Text.')).join()).toMatch(/needs imageAlt/);
    expect(validate(pair('01', { ...d, image: '/media/clearlease-logo.png', imageAlt: 'Logo' }, 'Text.'))).toEqual([]);
  });
  it('passes on the real content', () => {
    const real = ['de', 'en'].flatMap((l) => readdirSync(`src/content/ressourcen/${l}`).map((f) => {
      const src = readFileSync(`src/content/ressourcen/${l}/${f}`, 'utf8');
      const [, fm, body] = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      const get = (k) => fm.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'))?.[1];
      return { id: `${l}/${f.replace(/\.md$/, '')}`, data: { cat: get('cat'), date: get('date'), until: get('until'), neu: get('neu') === 'true' }, body };
    }));
    expect(validate(real)).toEqual([]);
  });
});

describe('sitemap pairs', () => {
  it('pair every item and filter by number and index', () => {
    const pairs = ressourcenUrlPairs();
    expect(pairs).toContainEqual({ de: '/ressourcen/news/', en: '/en/resources/news/' });
    expect(pairs).toContainEqual({ de: '/ressourcen/produkt-updates/', en: '/en/resources/product-updates/' });
    expect(pairs.length).toBe(readdirSync('src/content/ressourcen/de').length + 3);
  });
  it('has as many German as English categories', () => expect(CATS.de.length).toBe(CATS.en.length));
});

describe('rssFeed', () => {
  it('escapes text and keeps the order it is given', () => {
    const out = rssFeed({ title: 'R&D', link: 'https://x/', description: '<b>', lang: 'de', self: 'https://x/feed.xml', items: [
      { title: 'A & "B"', text: 'x < y\u0001', link: 'https://x/a/', date: '2026-10-22', cat: 'News' },
      { title: 'C', text: 'z', link: 'https://x/c/' },
    ] });
    expect(out).toContain('<title>R&amp;D</title>');
    expect(out).toContain('<title>A &amp; &quot;B&quot;</title>');
    expect(out).toContain('<description>x &lt; y</description>');
    expect(out).toContain('<pubDate>Thu, 22 Oct 2026 08:00:00 GMT</pubDate>');
    expect(out.indexOf('/a/')).toBeLessThan(out.indexOf('/c/'));
    expect(out.split('<pubDate>').length).toBe(2);
  });
});
