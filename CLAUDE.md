# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing website for Clearlea.se — an AI-powered lease administration SaaS targeting commercial real estate professionals (property managers, asset managers, transaction managers). No build step required; files are served as-is.

## Development

No package manager or build toolchain. Run locally with any HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. There is no lint, test, or CI pipeline.

## Architecture

### File Layout

- `index.html` — Main homepage (~51 KB)
- `landings/` — Persona-specific landing pages (`property-managers.html`, `asset-managers.html`, `transaction-managers.html`, `_template.html`)
- `assets/` — All JS and CSS
  - `i18n.js` — Internationalization engine
  - `script.js` — Carousel, form handling, markdown loading
  - `styles.css` — CSS custom properties and component styles
  - `christmas.js` / `christmas.css` — Seasonal theme (auto-activates Dec 1 – Jan 6)
- `locales/` — Translation JSON files: `de.json`, `en.json`, `nl.json`, `fr.json`
- `resources/` — Static assets: images, Lottie animations, logos, markdown content

### Internationalization

`i18n.js` loads a locale JSON on `DOMContentLoaded`. Elements are translated via `data-i18n="key"` attributes (and `data-i18n-placeholder` for inputs). Language is selected via the `?lang=` query parameter, persisted in `localStorage`, with a fallback chain: query param → localStorage → browser language → German.

After translations are applied, a custom `translationsLoaded` event is dispatched so dependent code can react.

### Interactivity

Alpine.js (CDN, v3) handles component state: dropdown menus, FAQ accordion, tabs. The carousel is managed by a custom `window.carousel()` function in `script.js` with auto-rotation and IntersectionObserver-driven reveal animations.

### Scheduling / Forms

Cal.com is embedded as a scheduling widget. Name, email, and company fields in the page update the Cal prefill config dynamically via input event listeners.

### Theming

CSS custom properties under `:root` in `styles.css` define the color palette using `--clr-*` names. The Christmas theme swaps these variables and adds 30 procedurally-generated snowflake elements.

### Third-party Libraries (all via CDN)

Tailwind CSS, Alpine.js, Lucide icons, Lottie, Marked.js (lazy-loaded for markdown pages), Cal.com embed.

## Key Conventions

- **Translation keys:** Match the structure in `locales/de.json` (German is the canonical locale).
- **New sections in `index.html`:** Add a corresponding anchor (`id="..."`) and navigation link; include `scroll-margin-top: 96px` to offset the fixed header.
- **New landing pages:** Start from `landings/_template.html`.
- **Color variables:** Use `var(--clr-primary)` etc. from `styles.css`; do not hardcode hex values in HTML.
- **Defensive CDN checks:** When calling CDN-loaded globals (e.g. `window.lucide`), guard with `typeof` checks, as in existing code.
