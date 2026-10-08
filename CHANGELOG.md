# Changelog

All notable changes to clearlea.se. Versions follow `MAJOR.MINOR.PATCH.MICRO`.

## [1.0.1.1] - 2026-10-08

EXPO REAL is over, and the site now shows it.

### Fixed
- The nightly rebuild failed on 8 October, so the EXPO REAL announcements stayed online after the fair. The English check now accepts translated column headings in the phone tables, and the rebuild goes through again. The phone layouts from 1.0.1.0 go live with it.

### Added
- A test that checks every dated element on every page: present on its last day, gone the day after. Dates in the wrong format now fail the build instead of never expiring.
- `docs/events.md`: how to announce the next event, preview it and check that it disappeared afterwards.

## [1.0.1.0] - 2026-10-02

Phone layouts for the parts of Website v1 that only worked on desktop.

### Fixed
- Workflow tracks (Startseite, Plattform, Lösungen) become a vertical timeline on phones and tablets. The cards fit their text, and the pulse follows the scroll position.
- The Lösungen hero shows one property card on phones instead of a table that scrolled sideways, the same split as the Startseite hero.
- The KI-Teams comparison shows one block per criterion on phones instead of a table that scrolled sideways.

## [1.0.0.0] - 2026-10-02

Website v1: the founder-approved design from the Design canvas, live as the new clearlea.se in German and English.

### Added
- Ten pages in German and English: Startseite, Plattform, three Lösungen pages, Für KI- & IT-Teams, Trust Center, Ressourcen, Unternehmen and Gespräch, plus Impressum, Datenschutz, AGB and a 404 page.
- A hands-on demo in the hero: drop or tap a document and watch it update the property list, with source, quality signal and a next step. The desktop shows a slim table with a floating notification, and phones show one property card.
- Booking on the Gespräch page through an inline Cal.com calendar, prefilled from the page that sent the visitor.
- Interactive sections from the design: workflow explorer, AI comparison, case studies, the Trust Center scratch reveal and the Indexmiete calculator.
- Link previews for every page: their own preview image, title and short description for LinkedIn, WhatsApp, Teams and Slack. Google gets the site name, breadcrumbs, logo and FAQ data.
- `/agent.md` and `/llms.txt`: a curated summary for AI assistants, linked in every footer. AI search and assistant crawlers may read the whole site.
- Hover, press and focus states for every button.
- Three easter eggs for the curious.
- The founders' LinkedIn profiles on the Unternehmen page and the company profile in the search data.

### Changed
- The site is built with Astro and deployed to GitHub Pages by GitHub Actions, with a daily rebuild so time-limited content (EXPO REAL) drops out on its own, including the "Neu" counter.
- "Anmelden" opens app.clearlea.se.
- Fonts are self-hosted. The site loads no analytics and no Google Fonts.

### Fixed
- Old addresses (landing pages, old legal pages, and `?lang=en` on the homepage) redirect to their new pages.
- Every email address is a working mailto link.

### Removed
- The previous one-page site, its landing pages, the NL/FR translations and the seasonal theme.
