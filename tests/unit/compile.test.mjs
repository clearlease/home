// The design compiler (src/dc/compile.mjs): link rewriting, date-based expiry and its guards.
import { describe, it, expect, afterEach } from 'vitest';
import { compileDC } from '../../src/dc/compile.mjs';
import { LINKS } from '../../src/site.config.mjs';

const page = (body) => `<html><body><x-dc>${body}</x-dc></body></html>`;
const code = (body, opts = {}) => compileDC(page(body), { lang: 'de', page: 'Home', ...opts }).code;

describe('links', () => {
  it('rewrites design links to production routes, with anchors', () => {
    expect(code('<a href="Plattform.dc.html" data-anchor="cockpit">x</a>')).toContain('/plattform/#cockpit');
    expect(code('<a href="Plattform.dc.html">x</a>', { lang: 'en' })).toContain('/en/platform/');
  });

  it('turns /en in a German page into the same page in English, and back', () => {
    expect(code('<a href="/en">EN</a>', { page: 'Trust-Center' })).toContain('/en/trust-center/');
    expect(code('<a href="/de">DE</a>', { lang: 'en', page: 'Trust-Center' })).toContain('/trust-center/');
  });

  it('localizes legal links', () => {
    expect(code('<a href="/datenschutz">x</a>', { lang: 'en' })).toContain('/en/privacy/');
  });

  it('fills [APP-URL] and [LINKEDIN-*] from LINKS', () => {
    expect(code('<a href="[APP-URL]">x</a>')).toContain(LINKS.appUrl);
    expect(code('<a href="[LINKEDIN-FABIAN]">x</a>')).toContain(LINKS.linkedinFabian);
    expect(code('<a href="[LINKEDIN-HIERONYMUS]">x</a>')).toContain(LINKS.linkedinHieronymus);
  });

  it('refuses links to pages that do not exist', () => {
    expect(() => code('<a href="Gibtsnicht.dc.html">x</a>')).toThrow(/unknown page/);
  });
});

describe('data-until / data-from', () => {
  afterEach(() => { delete process.env.SITE_BUILD_DATE; });
  const badge = '<span data-until="2026-10-07">EXPO-ALT</span><span data-from="2026-10-08">NACH-EXPO</span>';

  it('keeps the element on its last day and drops it the day after', () => {
    process.env.SITE_BUILD_DATE = '2026-10-07';
    const on = code(badge);
    expect(on).toContain('EXPO-ALT');
    expect(on).not.toContain('NACH-EXPO');
    process.env.SITE_BUILD_DATE = '2026-10-08';
    const after = code(badge);
    expect(after).not.toContain('EXPO-ALT');
    expect(after).toContain('NACH-EXPO');
  });

  it('never ships the date attributes themselves', () => {
    expect(code(badge)).not.toMatch(/data-(until|from)/);
  });
});

describe('guards', () => {
  it('refuses unknown slots', () => {
    expect(() => code('<div data-slot="nope"></div>')).toThrow(/unknown data-slot/);
  });
  it('refuses template expressions it cannot compile safely', () => {
    expect(() => code('<p>{{a + b}}</p>')).toThrow(/Unsupported template expression/);
  });
  it('strips DEV comments', () => {
    expect(code('<!-- DEV · intern: ask Fabian --><p>ok</p>')).not.toContain('ask Fabian');
  });
});
