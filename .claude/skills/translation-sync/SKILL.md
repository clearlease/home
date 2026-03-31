---
name: translation-sync
description: Use when editing HTML files or locale JSON files, when adding new sections or landing pages, or before committing content changes. Identifies translation keys used in HTML but missing from one or more locale files, and flags orphaned keys that exist in locales but are never referenced.
---

# translation-sync

## Overview

Scans all HTML pages for `data-i18n` and `data-i18n-placeholder` keys and cross-checks them against all four locale files (`de`, `en`, `nl`, `fr`). Reports missing keys, orphaned keys, and known JS-dynamic keys.

German (`de.json`) is the canonical locale — all new keys must appear there first.

## How to Run

```bash
python3 .claude/skills/translation-sync/check-translations.py
```

Run from the repo root. No dependencies beyond Python 3.

## What It Checks

| Check | Description |
|-------|-------------|
| Missing keys | Used in HTML but absent from one or more locale files |
| Orphaned keys | Present in locale files but not in any HTML file |
| JS-dynamic keys | Known exceptions loaded via `window.getTranslation()` in JS |

## Known JS-Dynamic Keys (Not in HTML)

These keys are intentionally absent from HTML but must remain in all locale files:

- `christmas.banner` — injected by `assets/christmas.js`
- `pmLanding.slide6.animated.1` through `.4` — cycled via script in `landings/property-managers.html`

The script lists these as informational, not errors.

## File Scope

**Scanned HTML files:** `index.html` + all files in `landings/` **except** `landings/_template.html` (scaffold file, not a live page).

**Scanned locale files:** `locales/de.json`, `locales/en.json`, `locales/nl.json`, `locales/fr.json`

## After Adding New Content

1. Add the key to `locales/de.json` first
2. Copy to `en.json`, `nl.json`, `fr.json` with translated values
3. Run `translation-sync` to verify no locale is missing the key
4. If the key is loaded from JS (not `data-i18n`), add it to the `JS_DYNAMIC_KEYS` set at the top of `check-translations.py`

## Quick Reference

| Attribute | Used for |
|-----------|----------|
| `data-i18n="key"` | Text content of an element |
| `data-i18n-placeholder="key"` | Placeholder text on `<input>` elements |
