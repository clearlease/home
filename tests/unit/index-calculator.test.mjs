// The Indexmiete calculator on /ressourcen (logic lives in the approved design's script).
import { describe, it, expect } from 'vitest';
import { DCComponent as De } from '../../src/designs/de/Ressourcen.dc.html?dc';
import { DCComponent as En } from '../../src/designs/en/Ressourcen.dc.html?dc';

const calc = (C, state) => { const c = new C({}); c.state = state; return c.renderVals(); };

describe('Indexmiete berechnen', () => {
  const c = new De({});
  it('parses German number formats', () => {
    expect(c.num('1.234,56')).toBe(1234.56);
    expect(c.num('10.000')).toBe(10000);
    expect(c.num(' 118,0 ')).toBe(118);
    expect(c.num('abc')).toBeNull();
    expect(c.num('')).toBeNull();
  });
  it('formats with German separators', () => {
    expect(c.fmt(10296.6101)).toBe('10.296,61');
    expect(c.fmt(1234567.891)).toBe('1.234.567,89');
    expect(c.fmt(0.5)).toBe('0,50');
  });
  it('computes the default example: 10.000 € from 118,0 to 121,5', () => {
    const v = calc(De, {});
    expect(v.newRent).toBe('10.296,61 €');
    expect(v.delta).toBe('+2,97 % · +296,61 € pro Monat');
  });
  it('handles a falling index', () => {
    const v = calc(De, { rent: '5.000', ia: '120', ib: '110' });
    expect(v.newRent).toBe('4.583,33 €');
    expect(v.delta.startsWith('-8,33 %')).toBe(true);
  });
  it('asks for numbers when input is invalid or the base index is zero', () => {
    expect(calc(De, { rent: 'x', ia: '118', ib: '120' }).newRent).toBe('–');
    expect(calc(De, { rent: '1000', ia: '0', ib: '120' }).delta).toBe('Bitte Zahlen eingeben');
  });
});

describe('Index-linked rent (EN)', () => {
  const c = new En({});
  it('parses English number formats', () => {
    expect(c.num('1,234.56')).toBe(1234.56);
    expect(c.num('118.5')).toBe(118.5);
    expect(c.num('10,000')).toBe(10000);
  });
  it('computes the same result as the German page, in English format', () => {
    const v = calc(En, {});
    expect(v.newRent).toBe('€10,296.61');
    expect(v.delta).toBe('+2.97% · +€296.61 per month');
  });
});
