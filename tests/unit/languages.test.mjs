import { describe, it, expect } from 'vitest';
import { ROUTES, route, LANGS } from '../../src/site.config.mjs';

describe('French is homepage-only', () => {
  it('has a French route for the homepage and nothing else', () => {
    expect(LANGS).toContain('fr');
    expect(Object.entries(ROUTES).filter(([, r]) => r.fr).map(([k]) => k)).toEqual(['Home']);
    expect(route('Home', 'fr')).toBe('/fr/');
  });
  it('sends every other French link to the English page', () => {
    for (const [key, r] of Object.entries(ROUTES)) if (key !== 'Home') expect(route(key, 'fr')).toBe(r.en);
  });
  it('keeps German and English routes unchanged', () => {
    expect(route('Plattform', 'de')).toBe('/plattform/');
    expect(route('Plattform', 'en')).toBe('/en/platform/');
  });
});
