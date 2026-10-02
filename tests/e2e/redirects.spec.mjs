// Old URLs from the previous site land on the matching new page.
import { test, expect } from '@playwright/test';

const OLD = {
  '/landings/property-managers.html': '/loesungen/property-management/',
  '/landings/asset-managers.html': '/loesungen/bestandshalter/',
  '/landings/transaction-managers.html': '/loesungen/bestandshalter/',
  '/privacy.html': '/datenschutz/',
  '/terms.html': '/agb/',
  '/impressum.html': '/impressum/',
  '/datenschutz.html': '/datenschutz/',
  '/agb.html': '/agb/',
  '/loesungen/': '/',
  '/?lang=en': '/en/',
};
// Handled by GitHub Pages itself (folder redirect, index.html, 404), not by the local preview server.
const HOST_ONLY = { '/index.html': '/', '/plattform': '/plattform/', '/en/platform': '/en/platform/' };
const live = /^https:\/\/(www\.)?clearlea\.se/.test(process.env.BASE_URL || '');
for (const [from, to] of Object.entries(OLD)) {
  test(`${from} -> ${to}`, async ({ page }) => {
    await page.goto(from);
    await page.waitForURL((u) => u.pathname === to);
    await expect(page.locator('h1, main').first()).toBeVisible();
  });
}
for (const [from, to] of Object.entries(HOST_ONLY)) {
  test(`host: ${from} -> ${to}`, async ({ page }) => {
    test.skip(!live, 'GitHub Pages behaviour; run with BASE_URL=https://www.clearlea.se');
    await page.goto(from);
    await page.waitForURL((u) => u.pathname === to);
  });
}

test('unknown paths show the 404 page', async ({ page }) => {
  const res = await page.goto('/gibt-es-nicht');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Diese Seite fehlt in der Akte.');
  await expect(page.getByText('Fehlt in der Akte', { exact: true })).toBeVisible();
});
