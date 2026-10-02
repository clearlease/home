# clearlea.se website

Source of https://www.clearlea.se, the marketing site of clearlea.se: operations intelligence for commercial real estate.

The site is built with Astro (static output) and Preact, and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main` and once a day.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build && npm test
```

The pages come from the approved Claude Design canvas: one `.dc.html` file per page and language in `src/designs/`. They are compiled to Preact components at build time. See `CLAUDE.md` for the architecture, content workflow and checks.

Contact: hello@clearlea.se
