<!-- /autoplan restore point: none (plan created fresh in this session, 2026-10-22) -->
# Plan: Ressourcen tiles open real articles, and new content takes one sentence

Branch: `claude/content-tiles-clickable-4667c2` · Base: `main` · Hosting: GitHub Pages (static, no server, nightly rebuild 01:15 UTC)

## Problem

- The 8 live tiles on `/ressourcen/` link to generic pages (`/plattform/`, `/unternehmen/`, `/trust-center/`). A reader who clicks "MCP-Server" lands on the product page, not on the news. Nothing is shareable as a link of its own, nothing ranks as a news item.
- Each item is frontmatter only. `src/lib/content.mjs` and `src/content.config.ts` say it outright: "a body below the frontmatter is not published".
- Filter tabs are client-side state only: no URL, the back button loses them, they cannot be linked. The design's own DEV note asks for `/ressourcen/news`, `/ressourcen/produkt-updates`.
- Creating an item means hand-writing frontmatter in two files (DE + EN), picking the next number and committing. No template, no checks for brand voice or claims.

## Premises (confirmed by the founder, D1 to D4)

| # | Premise | Answer |
|---|---------|--------|
| P1 | A click opens an article page of its own: `/ressourcen/<slug>/` and `/en/resources/<slug>/` | Yes |
| P2 | Authoring stays Markdown in the repo, driven by a repo Claude skill that drafts DE+EN, checks voice and claims, builds and opens a PR. Merge means live. | Yes |
| P3 | v1 browsing: filter URLs and an RSS feed. Prev/next and pagination are out. | Yes |
| P4 | Every article exists in German and English | Yes |

## Design

### Content model (`src/content.config.ts`)

- The body below the frontmatter becomes the article. **An item with a body gets an article page; an item without a body keeps linking to `href`** (EXPO cal.com link, `#indexrechner`). The 8 existing items keep working unchanged.
- New optional fields: `summary` is not needed (the existing `text` is the teaser and the meta description). `date` (already in the schema) becomes **required when there is a body**, as `YYYY-MM-DD`. It drives sort order of the feed, the visible date and Article JSON-LD.
- `href` on an article item becomes the "further link" at the end of the article (e.g. to `/plattform/#workflows`). It keeps accepting `Page.dc.html` and resolves through the existing `__href` / `route()` logic.
- Pairing DE and EN: by the `nn` filename prefix (`02-…` in `de/` pairs with `02-…` in `en/`). The slug is the filename after `nn-`. DE and EN slugs differ, like every other route.
- Reserved slugs (filter pages): `news`, `produkt-updates`, `werkzeuge`, `product-updates`, `tools`, `feed.xml`. A clash fails the build.

### Pure helpers (`src/lib/articles.mjs`, new, no Astro imports so vitest can load it)

- `slugOf(id)`, `pairByNumber(entries)` → `{ nn, de, en }`, `validate(pairs)` → list of errors (missing twin, body on one side only, missing `date`, reserved slug, duplicate `nn`).
- `articlePath(lang, slug)` → `/ressourcen/<slug>/` or `/en/resources/<slug>/`.
- `filterPath(lang, cat)` and the category ↔ slug map (`News`↔`news`, `Produkt-Updates`↔`produkt-updates`, `Werkzeuge`↔`werkzeuge`; EN `News`/`Product updates`/`Tools`).

### Build-time loader (`src/lib/content.mjs`)

- `ressourcenItems(lang)` sets `href` to `articlePath(...)` when the entry has a body, else keeps `href`. Validation runs here once and throws with every problem listed.
- `ressourcenArticles(lang)` returns `{ slug, cat, title, text, date, html, moreHref, altPath }` for article pages (body rendered with `marked`, already a dependency, the same as the legal pages).

### Pages (`scripts/gen-pages.mjs` writes them, as it does every route)

- `src/pages/ressourcen/[slug].astro` and `src/pages/en/resources/[slug].astro`: `getStaticPaths()` over `ressourcenArticles(lang)`. Layout: `Shell.dc.html` (nav + footer, the legal-page pattern) with a `cl-prose` article: kicker (category · date), H1, lead (`text`), body, "further link", back link to the list filtered by its category, and the existing Gespräch CTA line.
- Filter pages `src/pages/ressourcen/[cat].astro` (+ EN): the Ressourcen design with a new `filter` prop. The design's `componentDidMount` reads `this.props.filter` as the start state; a tab click calls `history.replaceState` to the filter URL ("Alle" → `/ressourcen/`). Markup stays as approved; only the page logic changes.
- Feed: `src/pages/ressourcen/feed.xml.ts` and `src/pages/en/resources/feed.xml.ts`, hand-written RSS 2.0 (about 30 lines, XML-escaped; no new dependency). All live items, newest first by `date`; items without a body link to their `href`.

### Head and SEO (`src/layouts/Base.astro`)

- Base is keyed by `page` in `ROUTES`. New optional props: `title`, `paths: { de, en }` (canonical + hreflang), `ogType` (`article`), `crumbs` (3rd breadcrumb level), `ogImage`. Defaults keep every existing page byte-identical.
- Article JSON-LD (`NewsArticle`: headline, datePublished, inLanguage, publisher = Organization from `src/lib/schema.mjs`).
- `<link rel="alternate" type="application/rss+xml">` on the Ressourcen pages and articles.
- Sitemap hreflang pairs (`astro.config.mjs`): add article and filter pairs from `pairByNumber` reading `src/content/ressourcen` with `fs`.
- `scripts/og-images.mjs`: one preview image per article (kicker = category, title = H1) into `public/og/`, named `<lang>-ressourcen-<slug>.png`.

### Authoring skill (`.claude/skills/ressourcen-beitrag/SKILL.md`, new)

Trigger: "neuer Beitrag", "News posten", "Produkt-Update veröffentlichen", "Ressourcen-Artikel".

1. Ask for: what happened, category, link target, optional end date. Accept a pasted LinkedIn post, release note or Notion page as source.
2. Next free `nn`, slugs from the titles (lowercase, ASCII, umlauts transliterated).
3. Draft the German item (title, teaser `text`, body 150 to 400 words, `date` = today in Berlin), following the brand-voice checklist in `CLAUDE.md`.
4. Claims: list every number or claim; check each against the Notion "Website Claims & Estimates Register". If Notion is not connected, stop and show the list for the founder to confirm. Never invent a claim.
5. English twin per `docs/i18n/translation-brief.md`.
6. `npm run build && npm run test:unit && npx playwright test ressourcen`; screenshot both article pages; open a PR with the screenshots. Merge = live (the deploy runs on push to `main`).
7. Never sets `neu: true` on more than 3 items; unsets the oldest.

`docs/ressourcen.md` (new, half a page): the file format, the body rule, the skill, and how to edit an item in GitHub's web editor without Claude.

## What already exists (reused, not rebuilt)

| Need | Existing code |
|------|---------------|
| Markdown items per language | `src/content/ressourcen/<lang>/*.md`, `src/content.config.ts` |
| Expiry (`until:`) | `src/lib/expiry.mjs`, `isLive()`, nightly deploy |
| Markdown → HTML | `marked` in `src/lib/content.mjs` (`legalHtml`) |
| Nav + footer around arbitrary content | `src/designs/<lang>/Shell.dc.html`, `data-slot="children"`, used by legal pages and 404 |
| Prose styling | `cl-prose` (legal pages) |
| Link rewriting for data hrefs | `__href` runtime in `src/dc/compile.mjs` |
| Route generation | `scripts/gen-pages.mjs` |
| OG images | `scripts/og-images.mjs` (satori + resvg) |
| JSON-LD | `src/lib/schema.mjs`, Base.astro breadcrumbs |
| Sitemap with hreflang | `astro.config.mjs` + `@astrojs/sitemap` |
| Brand voice + translation rules | `CLAUDE.md`, `docs/i18n/translation-brief.md`, `npm run check:i18n` |

## NOT in scope

- **Nav "Neu" popover from data.** The popover and its count badge are hardcoded in all 22 design files (with `data-until` twins). New articles will not appear there automatically. Deferred: needs a compiler-level data injection into every nav; see TODOS. (Taste decision T2.)
- Prev/next and related articles, pagination (founder D3: not in v1; pagination only matters past ~24 items).
- A browser CMS (Sveltia/Decap) or Notion as source (founder D2).
- Ratgeber / Webinare tabs (still "bald", disabled).
- Article images beyond the OG image. `image:` stays in the schema, unused.
- A canvas design for the article page. v1 uses the Shell + prose pattern; a canvas pass can follow.
- Backfilling bodies for the 8 existing items. The skill can do it one item at a time later; until then they keep their current links.

## Error & Rescue Registry

| Error | Where | Rescue |
|-------|-------|--------|
| EN twin missing for a DE `nn` | `validate()` at build | Build fails, message names the file and the missing twin |
| Body in DE, none in EN | `validate()` | Build fails |
| Article without `date` | content schema refine | Build fails with the file name |
| Slug clashes with a filter slug | `validate()` | Build fails |
| Duplicate `nn` | `validate()` | Build fails |
| Claim not in register | skill step 4 | Skill stops, asks the founder |
| Notion not connected | skill step 4 | Skill lists claims for manual confirmation |
| Expired item (`until`) with an article page | loader | Tile and feed entry go; the article page stays (permanent URL). (Taste decision T1.) |
| Nightly build fails on a broken item | deploy.yml | Site keeps the last good build; `docs/events.md` already covers the failure path |

## Failure Modes Registry

| Failure | User sees | Covered by | Critical gap? |
|---------|-----------|------------|---------------|
| Tile links to a 404 | Dead click | e2e: every tile href returns 200 | No |
| Filter URL loads but shows "Alle" | Wrong list | e2e: `/ressourcen/news/` has News tab selected and only News tiles | No |
| Back button after tab click | Leaves the page | `replaceState`, not `pushState`, so no history spam; e2e checks URL | No |
| hreflang points to the wrong twin | Google pairs DE/EN wrong | unit: `pairByNumber`; e2e: alternate link on article returns 200 | No |
| Feed invalid XML (`&` in title) | Feed readers break | unit: feed builder escapes; e2e: feed parses with DOMParser | No |
| Article page missing from sitemap | Slower indexing | build check in e2e (sitemap contains article URLs) | No |
| Existing pages change markup | Approved design drifts | `npm run check:copy`, existing visual screenshots | No |
| Expired event article stays live | Stale "book a slot" text | T1 decision; skill sets no body on time-limited events by default | Watch |

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 1 | Intake | Article page per item | Premise (user) | n/a | Founder D1 | Modal, deep links |
| 2 | Intake | Repo skill + Markdown | Premise (user) | n/a | Founder D2 | Browser CMS, Notion |
| 3 | Intake | Filter URLs + RSS | Premise (user) | n/a | Founder D3 | Prev/next, pagination |
| 4 | Intake | DE + EN always | Premise (user) | n/a | Founder D4 | DE-only allowed |
| 5 | CEO | Body present ⇒ article; no body ⇒ old link | Mechanical | P1, P5 | Backward compatible, no migration of 18 files | Require body on every item |
| 6 | CEO | Pair DE/EN by `nn` prefix | Mechanical | P5 | Already the naming convention; no new field | `twin:` frontmatter field |
| 7 | CEO | Article layout = Shell + prose | Taste (T3) | P4, P6 | Reuses legal-page pattern, ships now | New canvas design first |
| 8 | CEO | Nav Neu popover stays hardcoded | Taste (T2) | P3 | 22 design files, compiler change | Data-driven popover in v1 |
| 9 | CEO | Expired article page stays, leaves list/feed | Taste (T1) | P1 | Shared LinkedIn links keep working | Delete page on expiry |
| 10 | Eng | Pure helpers in `src/lib/articles.mjs` | Mechanical | P5 | vitest cannot import `astro:content` | Logic inside content.mjs |
| 11 | Eng | Hand-written RSS, no `@astrojs/rss` | Mechanical | P3, P4 | 30 lines; no dependency for a few lines | Add dependency |
| 12 | Eng | Base.astro gets optional overrides, defaults unchanged | Mechanical | P5 | Base is keyed by `ROUTES`; articles are not in ROUTES | Add every article to ROUTES |
| 13 | Eng | Filter tabs use `replaceState` | Mechanical | P5 | No history spam, URL still shareable | `pushState` |
| 14 | Eng | Filter pages self-canonical with own title | Mechanical | P1 | Real category pages, not duplicates | noindex |
| 15 | Design | Start filter read in `renderVals` (`s.f \|\| this.props.filter \|\| 'Alle'`), drop `f: 'Alle'` from `componentDidMount` | Mechanical | P1 | SSR never runs componentDidMount, so filter pages shipped unfiltered HTML (verified at Ressourcen.dc.html:221) | Set state on mount |
| 16 | Design | Filter prop is the tab label, map checked against TABS in both designs | Mechanical | P5 | Tabs compare labels that differ per language | Pass slug |
| 17 | Design | Article pages link to their filter page ("Mehr News") so filter URLs are crawlable | Mechanical | P1 | Tabs are buttons, not links | Change tabs to links (touches approved markup) |
| 18 | Eng | Base.astro: `description` prop wins with `paths`; `paths` drives canonical, alternate, x-default; breadcrumb level 2 stays `route(page)`; dist diff of existing 20 pages proves no change | Mechanical | P1 | Verified: DESCRIPTIONS[page] would override every article | Partial overrides |
| 19 | Eng | Filter pages are static files (`ressourcen/news/index.astro` …), only `[slug].astro` is dynamic | Mechanical | P5 | No two dynamic routes in one folder; collisions become build errors | `[cat]` + `[slug]` |
| 20 | Eng | `resolveHref(lang, v)` in articles.mjs (route() + SITE_URL, `#x` against Ressourcen) for further link and RSS | Mechanical | P4 | `__href` is module-local; RSS needs absolute URLs | Duplicate logic per caller |
| 21 | Eng | `date` accepts quoted or unquoted YAML (same union as `until`) + YYYY-MM-DD check | Mechanical | P1 | GitHub web editor users type it unquoted | z.string() |
| 22 | Eng | Sort: dated items newest first, then undated by `order`; `order` optional for new items | Mechanical | P5 | New items would land last; no edit of 18 existing files | Skill renumbers order |
| 23 | Eng | `validate()` runs before `isLive`; checks cat/until/neu equal across a pair; rejects raw HTML, `.dc.html` and wrong-language links in bodies | Mechanical | P1 | One side expiring alone; pasted LinkedIn HTML | Trust input |
| 24 | Eng | Sitemap pairs from filenames only (no YAML parse in astro.config) | Mechanical | P5 | Slug lives in filename | Hand frontmatter parser |
| 25 | Eng | e2e adds one article + one filter page to routes.mjs (axe, visual, phone), JS-disabled filter check, article H1/lead check | Mechanical | P1 | check:copy covers design routes only | Extend check:copy |
| 26 | DX | Skill: step 0 checks Notion connector and git state, branches from fresh `origin/main`, picks nn after fetch; runs build + test:unit + check:copy locally, Playwright left to CI; PR body describes the change in text; warns every run that the nav Neu popover is not updated | Mechanical | P1, P3 | 10-min target is "PR in 10 min, live after CI (~10 min)" | Local Playwright, screenshots in PR |
| 27 | DX | Skill runs the brand-voice checklist itself (no `brand-voice-reviewer` agent exists in the repo) | Mechanical | P4 | Agent named in CLAUDE.md is missing | Ship a new agent |
| 28 | CEO | Backfill bodies for the 2 current `neu` items (MCP-Server, Workflows) in v1 | Taste (T4) | P1 | Otherwise launch day looks identical to today | Ship with zero articles |

## Review voices

Codex: unavailable (CLI not installed) → `[subagent-only]`. One independent Claude subagent reviewed strategy, design, eng and DX in a single pass.

```
DUAL VOICES — CONSENSUS (subagent-only, so no row can be CONFIRMED)
  CEO   premises valid: yes · right problem: yes · scope: gap (ships no visible article) · 6-month: Neu popover goes stale
  Design filter SSR: CRITICAL (fixed, #15) · crawlability: gap (fixed, #17) · states/mobile: gap (fixed, #25)
  Eng   Base.astro overrides: HIGH (fixed, #18) · href resolver: HIGH (fixed, #20) · sort order: HIGH (fixed, #22) · concurrent PRs: HIGH (see Your steps)
  DX    10-min target: HIGH (restated, #26) · Notion auth + missing agent: MEDIUM (#26, #27)
```

## Architecture

```
src/content/ressourcen/{de,en}/NN-slug.md ──► content.config.ts (schema, date union)
                    │                                   │
                    ▼                                   ▼
        src/lib/articles.mjs (pure)  ◄──────  src/lib/content.mjs (getCollection, marked)
   slugOf · pairByNumber · validate ·            ressourcenItems(lang) ──► Ressourcen.dc.html (tiles, filter prop)
   articlePath · filterPath · resolveHref        ressourcenArticles(lang) ─► ressourcen/[slug].astro ─► Shell.dc.html + cl-prose
        │            │                                       │                       ressourcen/news/index.astro …
        ▼            ▼                                       ▼
 astro.config.mjs   og-images.mjs                  ressourcen/feed.xml.ts (RSS)
 (sitemap pairs)    (per-article PNG)              Base.astro (+title, description, paths, ogType, crumbs, NewsArticle)
                                   scripts/gen-pages.mjs writes every .astro above
```

## Your steps (cannot be done from code)

- GitHub branch protection on `main`: require the Test check and "branches up to date", so two article PRs cannot both pick the same `nn` and break the nightly deploy.
- Approve the German body copy for the 2 backfilled articles (T4) and any claim in them against the register.

## TODOS (deferred)

- Nav "Neu" popover from data instead of 22 hardcoded copies (compiler-level injection). Until then the skill reminds you on every run.
- Canvas design for the article page (v1 = Shell + prose).
- Prev/next, related articles, pagination (past ~24 items).

## Completion summary

Premises 4/4 confirmed by founder · 28 decisions (4 premise, 20 mechanical, 4 taste) · 0 user challenges · 1 critical found and fixed in plan (filter SSR) · test plan: ~/.gstack/projects/clearlease-home/hieronymus-content-tiles-test-plan-20261022-160030.md

## GSTACK REVIEW REPORT

Status: APPROVED by founder 2026-10-22 (as-is, T1 to T4 accepted). Voices: subagent-only (Codex not installed).
