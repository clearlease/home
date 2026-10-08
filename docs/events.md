# Time-limited content (events)

Announcements for trade fairs, webinars or other events can switch on and off by date, with no manual deploy. The site is static, so "by date" means **the build day**. The deploy workflow rebuilds every night at 03:15 Berlin time and publishes the result.

EXPO REAL 2026 (5 to 7 October 2026) was the first event to use this. Its markup is still in the source as the worked example. It no longer appears in builds from 8 October 2026.

## How it works

| Where | How to date it | Checked against |
| --- | --- | --- |
| Any element in a design (`src/designs/<lang>/*.dc.html`) | `data-until="YYYY-MM-DD"`: shown up to and including that day. `data-from="YYYY-MM-DD"`: shown from that day on. | Build day |
| Ressourcen item (`src/content/ressourcen/<lang>/*.md`) | `until: "YYYY-MM-DD"` in the frontmatter | Build day |
| Glass-ball tip on the Startseite logo (`tips()` in `Home.dc.html`) | `until: 'YYYY-MM-DD'` on the tip | Visitor's clock, end of day at UTC+2 |

- **Build day** is today's date in Berlin, from `buildDay()` in `src/site.config.mjs`. `src/lib/expiry.mjs` makes the decision for both the designs and Ressourcen.
- **Expired elements are removed at build.** The compiler (`src/dc/compile.mjs`) leaves them out of the HTML and the client bundle, and drops the `data-until` / `data-from` attributes. Nothing is hidden with CSS.
- **Dates must be `YYYY-MM-DD`.** Anything else, such as `7.10.2026`, fails the build instead of never expiring.
- **The tips are the one client-side check**, because they rotate in the browser. The cut-off is hard-coded as `T23:59:59+02:00` (summer time). For a winter event the tip disappears one hour late, at 01:00 Berlin time. That is harmless for a decorative tip.
- `items()` in `Ressourcen.dc.html` holds a copy of the list for the canvas only. The built page uses the Markdown files instead, so the copy does not need dates.

## Where an event can appear (EXPO REAL 2026 example)

Search the source for `exporeal-2026` to see every element. Each one exists in German and English, with the same structure (`npm run check:i18n`).

1. **"Neu" popover card**, in the nav of every page and in `Shell.dc.html` (legal pages, 404). It is an `<a data-until=…>` card in `#news-pop`. Edit the nav in `Unternehmen.dc.html` and run `node scripts/make-shell.mjs`. Every other page carries its own copy of the nav, so change them all.
2. **"Neu" badge count**, on every nav. Two twin `<span>`s: `data-until="<last day>"` with the higher count, and `data-from="<day after>"` with the lower count. Keep both `aria-label`s (`3 Updates` / `2 Updates`) in sync with the number.
3. **Ressourcen banner**: the dark `<a data-until=… class="cl-card">` above the filter tabs in `Ressourcen.dc.html`.
4. **Ressourcen item**: `src/content/ressourcen/<lang>/01-expo-real-2026-*.md` with `until:`. Use `order` to put it first, and `neu: true` to count it as new.
5. **Gespräch note**: the light-blue `<div data-until=…>` "Auf der EXPO REAL?" under the founder card in `Gespraech.dc.html`, linking to the event's Cal.com booking page.
6. **Glass-ball tip**: `{ k: 'EXPO REAL', t: 'Halle B3', s: 'Stand 121', until: '2026-10-07' }` in `tips()` in `Home.dc.html`.

You do not need all six. The popover card and the badge go together, because the badge counts the popover cards.

## Checklist for the next event

1. Add the elements above in `src/designs/de/` (ideally on the canvas first) and in `src/designs/en/`. Date every one with the event's last day.
2. If you add a popover card, add the badge twins: `data-until` with the new count, `data-from` (the day after) with the old count.
3. Add the Ressourcen item in both languages with `until:`.
4. Run the checks:
   ```bash
   npm run check:i18n
   npm run test:unit
   ```
   `tests/unit/expiry.test.mjs` finds every dated element in every design. It checks the date format, that the element is in the build on its last day, and that it is gone the day after. New events are covered automatically.
5. Preview both sides of the cut-off:
   ```bash
   SITE_BUILD_DATE=2026-10-07 npm run build && npm run preview
   SITE_BUILD_DATE=2026-10-08 npm run build && npm run preview
   ```
6. Merge. Push to `main` deploys.
7. **The morning after the event**, check that the 03:15 run of "Build and deploy to GitHub Pages" succeeded (GitHub › Actions), then look at the live site (below).

## If the event is still live after it ended

The nightly deploy runs `check:i18n`, the build, `check:copy` and the unit tests. **If any step fails, nothing is published, and production keeps the last good build, event included.** This happened after EXPO REAL 2026: a failing i18n check blocked the 8 October rebuild.

1. Find the failed run and its error:
   ```bash
   gh run list --workflow deploy.yml --limit 5
   ```
   ```bash
   gh run view <run-id> --log-failed
   ```
2. Fix the cause in a PR and merge it. The merge deploys.
3. To redeploy without a code change, for example after a flaky run:
   ```bash
   gh workflow run deploy.yml
   ```
4. Verify the live site:
   ```bash
   BASE_URL=https://www.clearlea.se npm test
   ```
   ```bash
   curl -s https://www.clearlea.se/ressourcen/ | grep -ci "expo real"
   ```

## Removing an old event from the source (optional)

The expired markup is invisible in builds, so removing it only tidies up. When you do, delete the elements listed above in both languages and on the canvas. Replace the badge twins with a single span that has no date. Delete the Ressourcen Markdown files. Run `npm run check:i18n` and `npm run test:unit`.
