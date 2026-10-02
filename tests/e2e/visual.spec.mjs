// Full-page screenshots of every page per viewport, for side-by-side review with the canvas.
// Saved to test-results/screens/<project>/<lang>-<page>.png (not compared against a baseline).
import { test } from '@playwright/test';
import { ALL } from './routes.mjs';

test.describe.configure({ mode: 'parallel' });
for (const { page: name, lang, path } of ALL) {
  test(`screenshot ${lang} ${name}`, async ({ page }, info) => {
    test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1 to capture');
    await page.emulateMedia({ reducedMotion: 'reduce' }); // final states, no mid-animation frames
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
    await page.evaluate(() => document.fonts.ready);
    // scroll through once so lazy images load, then back to the top
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `test-results/screens/${info.project.name}/${lang}-${name}.png`, fullPage: true });
  });
}
