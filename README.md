# clearlea.se website

Source of https://www.clearlea.se, the marketing site of clearlea.se: operations intelligence for commercial real estate.

The site is built with Astro (static output) and Preact, and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` and once a day. Each deploy first runs `check:i18n`, the build, `check:copy` and the unit tests, and publishes nothing if one fails. Pull requests run the same checks plus the Playwright suite (`.github/workflows/test.yml`).

```bash
npm install
npm run dev       # http://localhost:4321
npm run build && npm test
```

The pages come from the approved Claude Design canvas: one `.dc.html` file per page and language in `src/designs/`. They are compiled to Preact components at build time. See `CLAUDE.md` for the architecture, content workflow and checks.

Release notes are in `CHANGELOG.md`, and the current version is in `VERSION`.

Contact: hello@clearlea.se
