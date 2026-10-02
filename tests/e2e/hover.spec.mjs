// Every kind of button reacts to the mouse with the design system's hover state.
import { test, expect } from '@playwright/test';

const ready = (page) => page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const look = (loc) => loc.evaluate((el) => { const s = getComputedStyle(el); const svg = el.querySelector('svg'); return { bg: s.backgroundColor, color: s.color, border: s.borderTopColor, shadow: s.boxShadow, deco: s.textDecorationLine, svg: svg ? getComputedStyle(svg).transform : 'none' }; });

const CASES = [
  // [page, selector, expected change, description]
  ['/', 'section .cl-btn-primary', { bg: 'rgb(26, 53, 83)', svg: 'matrix(1, 0, 0, 1, 3, 0)' }, 'navy primary darkens to cl-navy-hover, arrow nudges'],
  ['/', 'section .cl-btn-ghost', { bg: 'rgba(19, 41, 61, 0.05)', border: 'rgb(19, 41, 61)' }, 'ghost gets a veil and a navy border'],
  ['/', 'header .cl-btn-tint', { bg: 'rgb(212, 230, 240)' }, 'news pill tints to cl-primary-100'],
  ['/', '.cl-link-arrow', { color: 'rgb(29, 100, 133)', svg: 'matrix(1, 0, 0, 1, 3, 0)' }, 'arrow link turns teal-600'],
  ['/', '.cl-btn-chip:not([aria-pressed="true"]):not([aria-selected="true"])', { shadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 999px inset' }, 'chip gets the hover veil'],
  ['/', 'section[aria-labelledby="cta-title"] .cl-btn-light', { bg: 'rgb(239, 246, 250)' }, 'white CTA on navy tints to cl-primary-50'],
  ['/', 'section[aria-labelledby="cta-title"] a:not([class])', { color: 'rgb(212, 230, 240)' }, 'e-mail link on navy lightens'],
  ['/', 'footer nav a', { deco: 'underline' }, 'footer links underline'],
  ['/trust-center/', '#unterlagen .cl-btn-ghost', { bg: 'rgba(19, 41, 61, 0.05)' }, 'document request buttons'],
  ['/loesungen/bestandshalter/', '.cl-chipbtn:not([aria-pressed="true"])', { shadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 999px inset' }, 'case chips'],
];

for (const [path, sel, want, what] of CASES) {
  test(`hover: ${what}`, async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1040, 'hover states are for mouse devices');
    await page.goto(path);
    await ready(page);
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const before = await look(el);
    await el.hover();
    await expect.poll(() => look(el)).toMatchObject(want);
    for (const k of Object.keys(want)) expect(before[k], `${k} should change on hover`).not.toBe(want[k]);
  });
}

test('hover: news popover cards get the hover veil', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1040, 'desktop navigation');
  await page.goto('/');
  await ready(page);
  await page.locator('header button[aria-controls="news-pop"]').click();
  const tile = page.locator('#news-pop .cl-tile').first();
  await tile.hover();
  await expect.poll(() => look(tile)).toMatchObject({ shadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 999px inset' });
});

test('keyboard focus shows the teal ring, white on the navy block', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const cta = page.locator('section .cl-btn-primary').first();
  await cta.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await cta.evaluate((el) => getComputedStyle(el).outlineColor)).toBe('rgb(36, 123, 160)');
  const light = page.locator('section[aria-labelledby="cta-title"] .cl-btn-light');
  await light.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await light.evaluate((el) => getComputedStyle(el).outlineColor)).toBe('rgb(255, 255, 255)');
});
