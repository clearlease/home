# clearlea.se website

Source of https://www.clearlea.se, the marketing site of clearlea.se: operations intelligence for commercial real estate. 10 pages in German and English, plus Impressum, Datenschutz and AGB.

The pages come from the approved Claude Design canvas (https://claude.ai/artifact/96aH2GJYY7RLdnzUWqKjUj): one `.dc.html` file per page and language in `src/designs/`. Astro compiles them into a static site with Preact for the interactive parts. `CLAUDE.md` explains the architecture, the content workflow and the checks in detail.

## Run it locally

You need Node 24 (npm 11).

```bash
npm ci
npm run dev
```

The site runs at http://localhost:4321. Restart `npm run dev` after changing `src/site.config.mjs` or `src/dc/compile.mjs`.

## Check it

```bash
npm run build
npm run check:i18n
npm run check:copy
npm run test:unit
npx playwright install chromium webkit
npm test
```

- `npm run build` writes the site to `dist/`, including a link-preview image per page.
- `npm run check:i18n` checks that the English designs match the German ones line for line.
- `npm run check:copy` checks that every design text reaches the built pages.
- `npx playwright install chromium webkit` is needed once per machine.
- `npm test` runs Playwright on desktop, tablet and phones: pages, links, redirects, interactions and accessibility.

Useful variants:

```bash
SCREENSHOTS=1 npx playwright test visual
```

This takes full-page screenshots of every page into `test-results/screens/`.

```bash
SITE_BUILD_DATE=2026-10-08 npm run build
```

This builds the site as of a given day, to preview content that expires.

```bash
BASE_URL=https://www.clearlea.se npm test
```

This runs the suite against the live site.

```bash
OFFLINE=1 npm test
```

This skips the test that needs cal.com.

## Change content

- **Page copy and layout:** edit `src/designs/de/<Page>.dc.html`, ideally on the canvas first, then mirror it in `src/designs/en/`.
- **Links:** "Anmelden", LinkedIn and Cal.com links live in `LINKS` in `src/site.config.mjs`.
- **Titles, descriptions, breadcrumbs:** these live in `src/seo.mjs`.
- **Ressourcen items:** one Markdown file each in `src/content/ressourcen/<lang>/`. Add `until: YYYY-MM-DD` for items that should disappear after a date.
- **AI agent summary:** `src/agent/agent.md`, served at `/agent.md` and `/llms.txt`.
- **Legal texts:** the Markdown files in `resources/content/`, German only.

Every claim and number must be backed by the "Website Claims & Estimates Register" in Notion. After editing copy, run the brand-voice review described in `CLAUDE.md`.

## Deploy

GitHub Pages serves the site, with **Settings › Pages › Source** set to **GitHub Actions**. The custom domain comes from `public/CNAME`.

- **Pushes to `main`:** `.github/workflows/deploy.yml` runs `check:i18n`, the build, `check:copy` and the unit tests, then publishes. If any step fails, nothing is published.
- **Daily rebuild:** the same workflow also runs every night, so content with an expiry date (`until:`, `data-until`, `data-from`) changes on its own.
- **Pull requests:** `.github/workflows/test.yml` runs the same checks plus the Playwright suite.

After a release, check the live site with `BASE_URL=https://www.clearlea.se npm test`. Then refresh changed link previews with LinkedIn's Post Inspector.

## Releases

Release notes are in `CHANGELOG.md`, and the current version is in `VERSION`.

Contact: hello@clearlea.se
