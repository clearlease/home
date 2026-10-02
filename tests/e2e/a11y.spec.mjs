// axe-core scan of every page in both languages: no serious or critical violations.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL } from './routes.mjs';

for (const { page: name, lang, path } of ALL) {
  test(`a11y ${lang} ${name}`, async ({ page }) => {
    // Reduced motion: scan final states, not colours caught mid-animation.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('[data-cal-embed]') // third-party booking iframe
      .exclude('[aria-hidden="true"]') // decorative background mocks (WCAG 1.4.3 exempts pure decoration)
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.length}x, e.g. ${v.nodes[0].target.join(' ')} :: ${v.nodes[0].failureSummary?.split('\n')[1] ?? ''}`);
    expect(serious, serious.join('\n')).toEqual([]);
  });
}
