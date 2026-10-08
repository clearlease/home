// Time-limited content (docs/events.md): every data-until / data-from element in the real designs
// shows up on the right days and nowhere else, and malformed dates are refused.
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'parse5';
import { compileDC } from '../../src/dc/compile.mjs';
import { isLive, checkDay } from '../../src/lib/expiry.mjs';

const dayAfter = (d) => new Date(Date.parse(d + 'T12:00:00Z') + 864e5).toISOString().slice(0, 10);
const dayBefore = (d) => new Date(Date.parse(d + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
// The longest single text node inside the element: a fingerprint that survives compilation intact.
const texts = (n) => (n.nodeName === '#text' ? [n.value.replace(/\s+/g, ' ').trim()] : (n.childNodes || []).flatMap(texts));
const text = (n) => texts(n).reduce((a, b) => (b.length > a.length ? b : a), '');
// Compiled code holds text as JS string literals; compare on a decoded, whitespace-folded form.
const norm = (s) => s.replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// Every dated element in every design: { lang, page, attr, day, text, html }
const dated = [];
for (const lang of ['de', 'en']) {
  for (const f of readdirSync(`src/designs/${lang}`).filter((f) => f.endsWith('.dc.html'))) {
    const html = readFileSync(`src/designs/${lang}/${f}`, 'utf8');
    (function walk(n) {
      for (const a of n.attrs || []) if (a.name === 'data-until' || a.name === 'data-from') dated.push({ lang, page: f.replace('.dc.html', ''), attr: a.name, day: a.value, text: text(n), html });
      (n.childNodes || []).forEach(walk);
    })(parse(html));
  }
}

describe('dated elements in the designs', () => {
  afterEach(() => { delete process.env.SITE_BUILD_DATE; });
  const build = (d, day) => { process.env.SITE_BUILD_DATE = day; return norm(compileDC(d.html, { lang: d.lang, page: d.page }).code); };

  it('finds them (the test would pass vacuously otherwise)', () => {
    expect(dated.length).toBeGreaterThan(0);
  });

  for (const d of dated) {
    const label = `${d.lang}/${d.page} ${d.attr}="${d.day}" "${d.text.slice(0, 50)}"`;
    it(label, () => {
      expect(checkDay(d.day, label)).toBe(d.day);
      // A data-until element must vanish the day after; a data-from element must be absent the day before.
      const [shown, hidden] = d.attr === 'data-until' ? [d.day, dayAfter(d.day)] : [d.day, dayBefore(d.day)];
      const probe = norm(d.text);
      if (!probe) return; // nothing textual to look for (e.g. an icon); the date format check above still applies
      expect(build(d, shown)).toContain(probe);
      // Twins (the Neu badge: "3" until, "2" from) can share short text with the rest of the page,
      // so only assert absence for text that is unique enough to identify the element.
      if (probe.length >= 12) expect(build(d, hidden)).not.toContain(probe);
    });
  }
});

describe('isLive', () => {
  it('shows an item through its last day and hides it the day after', () => {
    expect(isLive({ until: '2026-10-07' }, '2026-10-07')).toBe(true);
    expect(isLive({ until: '2026-10-07' }, '2026-10-08')).toBe(false);
  });
  it('hides an item before its first day', () => {
    expect(isLive({ from: '2026-10-08' }, '2026-10-07')).toBe(false);
    expect(isLive({ from: '2026-10-08' }, '2026-10-08')).toBe(true);
  });
  it('works across month and year boundaries', () => {
    expect(isLive({ until: '2026-12-31' }, '2027-01-01')).toBe(false);
    expect(isLive({ until: '2026-09-30' }, '2026-10-01')).toBe(false);
  });
  it('keeps items without dates', () => {
    expect(isLive({}, '2030-01-01')).toBe(true);
  });
  it('refuses dates that would compare wrongly as strings', () => {
    expect(() => isLive({ until: '7.10.2026' }, '2026-10-08')).toThrow(/YYYY-MM-DD/);
    expect(() => isLive({ until: '2026-10-7' }, '2026-10-08')).toThrow(/YYYY-MM-DD/);
    expect(() => isLive({ from: '' }, '2026-10-08')).toThrow(/YYYY-MM-DD/);
  });
});

describe('Ressourcen items', () => {
  const items = ['de', 'en'].flatMap((lang) =>
    readdirSync(`src/content/ressourcen/${lang}`).map((f) => ({ f, src: readFileSync(`src/content/ressourcen/${lang}/${f}`, 'utf8') })));
  for (const { f, src } of items) {
    const m = src.match(/^until:\s*"?([^"\n]*)"?\s*$/m);
    if (!m) continue;
    it(`${f} has a valid until: date`, () => expect(checkDay(m[1], f)).toBe(m[1]));
  }
});
