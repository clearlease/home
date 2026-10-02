---
name: translation-sync
description: Use when editing page designs in src/designs/de or src/designs/en, when adding a page, or before committing content changes. Checks that every English design is a pure translation of its German source and that German copy still reaches the built pages.
---

# translation-sync

German (`src/designs/de/<Page>.dc.html`) is the canonical, founder-approved copy. Each English file in `src/designs/en/` must have the same markup, styles and script logic. Only text, `alt`, `aria-label`, `title`, `placeholder` and script string literals may differ.

## How to run

```bash
npm run check:i18n                 # structure: EN vs DE, leftover German, dashes, brand spelling
npm run build && npm run check:copy  # every design text line appears in dist/
node scripts/render-design.mjs en <Page>   # read a page's English text end to end
```

## When German copy changes

1. Edit the German design.
2. Apply the same change, translated, to the English design. Use the glossary and fixed chrome translations in `docs/i18n/translation-brief.md`.
3. Run `npm run check:i18n` until every page prints `OK`.
4. Run the brand-voice review on the changed copy.
