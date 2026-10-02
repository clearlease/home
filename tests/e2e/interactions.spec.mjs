// The interactive parts the DEV notes specify, exercised in a real browser.
import { test, expect } from '@playwright/test';

const ready = (page) => page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const isDesktop = (page) => (page.viewportSize()?.width ?? 0) >= 1040;

test.describe('navigation', () => {
  test('Lösungen menu: keyboard opens, arrows move, Esc closes', async ({ page }) => {
    test.skip(!isDesktop(page), 'desktop navigation');
    await page.goto('/');
    await ready(page);
    const btn = page.locator('.cl-ddbtn').first();
    await btn.focus();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.cl-dd-menu a').first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.cl-dd-menu a').nth(1)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(btn).toBeFocused();
    await expect(page.locator('.cl-dd-menu').first()).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('news popover opens with 3 items and closes with Esc', async ({ page }) => {
    test.skip(!isDesktop(page), 'desktop navigation');
    await page.goto('/plattform/');
    await ready(page);
    const toggle = page.locator('header button[aria-controls="news-pop"]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const pop = page.locator('#news-pop');
    await expect(pop).toBeVisible();
    expect(await pop.locator('a').count()).toBeGreaterThanOrEqual(3); // 2 cards + "Alle Updates" after the EXPO card expires
    await page.keyboard.press('Escape');
    await expect(pop).toHaveCount(0);
  });

  test('mobile menu opens and lists every page', async ({ page }) => {
    test.skip(isDesktop(page), 'mobile navigation');
    await page.goto('/');
    await ready(page);
    const menu = page.locator('details.cl-mnav');
    await menu.locator('summary').click();
    await expect(menu).toHaveAttribute('open', '');
    for (const href of ['/plattform/', '/loesungen/bestandshalter/', '/ki-teams/', '/trust-center/', '/ressourcen/', '/unternehmen/']) {
      await expect(menu.locator(`a[href="${href}"]`)).toBeVisible();
    }
    await menu.locator('a[href="/plattform/"]').click();
    await expect(page).toHaveURL(/\/plattform\/$/);
  });

  test('language switch goes to the same page in English and back', async ({ page }) => {
    await page.goto('/trust-center/');
    await ready(page);
    const en = page.locator('a[hreflang="en"]').first();
    await expect(en).toHaveAttribute('href', '/en/trust-center/');
    await page.goto('/en/trust-center/');
    await expect(page.locator('a[hreflang="de"]').first()).toHaveAttribute('href', '/trust-center/');
  });
});

test.describe('Startseite', () => {
  test('hero demo: click a document, it is processed, the action is logged', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.locator('button.cl-doc').first().click();
    await expect(page.getByText('Laufzeit geändert: 31.12.2031')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Freigeben', exact: true }).click();
    await expect(page.getByText(/Erledigt/).first()).toBeVisible();
  });

  test('hero demo: drag a document onto the property list', async ({ page }) => {
    test.skip(!isDesktop(page), 'HTML5 drag and drop is a desktop pointer interaction; touch uses tap');
    await page.goto('/');
    await ready(page);
    await page.locator('button.cl-doc').nth(3).dragTo(page.getByText('Berlin · Friedrichstraße 112').first());
    await expect(page.getByText('Neue Miete: 15.632 € (+2,98 %)')).toBeVisible({ timeout: 5000 });
  });

  test('"Meine Aufgaben" view opens from the attention counter', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.getByRole('button', { name: /brauchen Aufmerksamkeit/ }).click();
    await expect(page.getByRole('tab', { name: 'Meine Aufgaben' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Rechnungsabweichung klären')).toBeVisible();
  });

  test('workflow library: chips switch the workflow track', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    const chip = page.locator('button[aria-pressed]', { hasText: 'Nebenkostenprüfung' }).first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Widerspruch entwerfen')).toBeVisible();
    await page.locator('button[aria-pressed]', { hasText: '+ Ihr Workflow' }).click();
    await expect(page.getByText('Ihr Auslöser')).toBeVisible();
  });

  test('AI comparison replays', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    const replay = page.getByRole('button', { name: 'Erneut abspielen' });
    await replay.scrollIntoViewIfNeeded();
    await replay.click();
    await expect(page.getByText('wartet').first()).toBeVisible();
    await expect(page.getByText('≈ 2.000 Tokens · ≈ 0,01 € · 3 s')).toBeVisible({ timeout: 6000 });
  });

  test('reduced motion: no autoplay, AI comparison shows the final state', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await ready(page);
    await expect(page.getByText('≈ 120.000 Tokens · ≈ 0,40 € · 48 s')).toBeVisible();
    await page.waitForTimeout(17_000); // longer than the 15 s idle autoplay delay
    await expect(page.getByText('Laufzeit geändert')).toHaveCount(0);
    await ctx.close();
  });
});

test.describe('Unterseiten', () => {
  test('Plattform: feature cards swap the product visual on focus and click', async ({ page }) => {
    await page.goto('/plattform/');
    await ready(page);
    const cards = page.locator('.cl-pick');
    await expect(cards).toHaveCount(6);
    await cards.nth(3).click();
    await expect(cards.nth(3)).toHaveAttribute('aria-pressed', 'true');
    await cards.nth(0).focus();
    await expect(cards.nth(0)).toHaveAttribute('aria-pressed', 'true');
  });

  test('Lösungen: case chips switch the mock, the action is done and logged', async ({ page }) => {
    await page.goto('/loesungen/bestandshalter/');
    await ready(page);
    const chips = page.locator('button.cl-chipbtn');
    await chips.nth(1).click();
    await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('section').first().getByRole('button').filter({ hasNotText: /Neu/ }).last().click();
    await expect(page.getByText(/protokolliert/).first()).toBeVisible();
  });

  test('Trust Center: keyboard focus reveals a blacked-out word', async ({ page }) => {
    await page.goto('/trust-center/');
    await ready(page);
    const word = page.locator('section').first().locator('p span[tabindex="0"]').first();
    const before = await word.evaluate((el) => getComputedStyle(el).backgroundImage + getComputedStyle(el).backgroundColor + el.getAttribute('style'));
    await word.focus();
    await expect.poll(() => word.evaluate((el) => getComputedStyle(el).backgroundImage + getComputedStyle(el).backgroundColor + el.getAttribute('style'))).not.toBe(before);
  });

  test('Ressourcen: filter tabs and the index calculator', async ({ page }) => {
    await page.goto('/ressourcen/');
    await ready(page);
    await page.getByRole('tab', { name: 'Werkzeuge' }).click();
    await expect(page.getByRole('tab', { name: 'Werkzeuge' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#indexrechner')).toBeVisible();
    const inputs = page.locator('#indexrechner input');
    await inputs.nth(0).fill('2.000');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('110');
    await expect(page.getByText('2.200,00 €')).toBeVisible();
  });

  test('Gespräch: the Cal.com booking calendar loads', async ({ page }) => {
    test.skip(!!process.env.OFFLINE, 'needs network');
    await page.goto('/gespraech/');
    await ready(page);
    await expect(page.locator('[data-cal-embed] iframe')).toBeAttached({ timeout: 20_000 });
  });
});

test.describe('easter eggs', () => {
  test('typing "nachtrag" opens Nachtrag 7, Esc closes it', async ({ page }) => {
    await page.goto('/plattform/');
    await ready(page);
    await page.locator('body').click({ position: { x: 5, y: 300 } });
    await page.keyboard.type('nachtrag');
    const card = page.getByRole('dialog', { name: '§ 1 Zwischen den Zeilen' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('button', { name: 'Nachtrag 7 schließen' })).toBeFocused();
    await expect(card.getByRole('link', { name: 'Gespräch vereinbaren' })).toHaveAttribute('href', '/gespraech/');
    await page.keyboard.press('Escape');
    await expect(card).toHaveCount(0);
  });

  test('typing "amendment" opens amendment 7 on English pages, not while typing in a field', async ({ page }) => {
    await page.goto('/en/resources/');
    await ready(page);
    await page.locator('#indexrechner input').first().fill('amendment');
    await expect(page.locator('#cl-nachtrag-7')).toHaveCount(0);
    await page.locator('h1').click();
    await page.keyboard.type('amendment');
    await expect(page.getByRole('dialog', { name: '§ 1 Reading between the lines' })).toBeVisible();
  });

  test('seven clicks on the brand dot open Nachtrag 7', async ({ page }) => {
    test.skip(!isDesktop(page), 'the glass ball is a desktop pointer gimmick');
    await page.goto('/');
    await ready(page);
    const dot = page.locator('.cl-glass').first();
    await dot.scrollIntoViewIfNeeded();
    for (let i = 0; i < 7; i++) await dot.click({ force: true }); // it wobbles while hovered
    await expect(page.locator('#cl-nachtrag-7')).toBeVisible();
  });

  test('the console greets developers', async ({ page }) => {
    const logs = [];
    page.on('console', (m) => logs.push(m.text()));
    await page.goto('/');
    await ready(page);
    expect(logs.join('\n')).toContain('Sie lesen Quellcode?');
  });
});
