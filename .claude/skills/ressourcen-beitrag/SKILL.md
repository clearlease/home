---
name: ressourcen-beitrag
description: Use when the founder wants to publish a news item, product update, tool or article on clearlea.se, or to edit or backfill an existing Ressourcen item. Triggers include "neuer Beitrag", "News posten", "Produkt-Update veröffentlichen", "Ressourcen-Artikel", "schreib einen Artikel für die Website", "post this on the website", or a pasted LinkedIn post, release note or Notion page with intent to publish it. Drafts German and English, checks brand voice and claims, builds, and opens a PR. Merge = live.
---

# ressourcen-beitrag

One Ressourcen item = two Markdown files with the same number: `src/content/ressourcen/de/<nn>-<slug>.md` and `src/content/ressourcen/en/<nn>-<slug>.md`. Text below the frontmatter makes it an article at `/ressourcen/<slug>/` and `/en/resources/<slug>/`; the tile links there. Format and rules: `docs/ressourcen.md`. The build checks every rule (`src/lib/articles.mjs`) and stops on any problem.

Target: PR open within 10 minutes. CI then tests and, after merge, deploys (about 10 more minutes).

## 0. Before drafting

- Notion: the claims check needs the "Website Claims & Estimates Register". If no Notion tool answers, tell the founder to connect Notion with `/mcp` now, or to confirm each claim by hand in step 4.
- Git: `git fetch origin && git switch -c ressourcen/<short-slug> origin/main`. Always branch from a fresh `origin/main`, never from the current branch, so the number in step 2 is free.
- Say once, every run: the nav "Neu" popover is hardcoded in the designs and does **not** pick up new items. Ask whether this item should replace one there; if yes, edit the popover entry in every design (`src/designs/{de,en}/*.dc.html`, then `node scripts/make-shell.mjs`), linking it with `href="[RESSOURCE-<nn>]"`.

## 1. Ask (only what is missing from the request)

- What happened, in one or two sentences, and the source (LinkedIn post, release note, Notion page, link).
- Category: News, Produkt-Updates or Werkzeuge (EN: News, Product updates, Tools).
- Further link at the end of the article (a page on the site, e.g. `Plattform.dc.html#workflows`, or an external URL). Optional.
- End date, only for events and offers that expire (`until: YYYY-MM-DD`; tile and feed disappear after that day, the article page stays).

## 2. Files

- Number: the highest `nn` in `src/content/ressourcen/de/` plus one, two digits.
- Slug: from the title, lowercase ASCII, umlauts as ae/oe/ue, ß as ss, words joined with `-`. Not `news`, `produkt-updates`, `werkzeuge`, `product-updates`, `tools`, `feed.xml`.
- Frontmatter (both languages; `cat`, `date`, `until`, `neu` must be equal in meaning):

```yaml
---
cat: "Produkt-Updates"
title: "…"            # the tile and the H1, max ~70 characters
text: "…"             # teaser on the tile, lead and meta description, max ~150 characters
neu: true
href: "Plattform.dc.html#workflows"   # optional further link
date: "2026-10-22"    # today in Berlin: TZ=Europe/Berlin date +%F
---
```

- `neu: true` on at most 3 items per language. Set the new item to `true` and the oldest `neu: true` item to `false`.
- Body: 150 to 400 words of Markdown. `##` headings, lists, bold, links. No raw HTML, no images. Links inside the body are production URLs in the article's language (`/plattform/` in German, `/en/platform/` in English).

## 3. German draft

Follow the brand voice in `CLAUDE.md` and check every line:

- Active voice ("Die KI extrahiert die Daten."), reader's benefit first, punchy and concrete.
- No Bürokratendeutsch. No em or en dashes as punctuation. "clearlea.se" always lowercase with the dot. "Sie", never "du".
- Reuse wording from the approved pages (`src/designs/de/*.dc.html`) for features the site already describes.

## 4. Claims

List every number, comparison and factual claim in the draft. Check each one against the Notion "Website Claims & Estimates Register" or against copy already on the approved pages. Remove or rephrase anything without a source. Never invent a number. If Notion is not connected, show the list and wait for the founder to confirm each line.

## 5. English twin

Translate per `docs/i18n/translation-brief.md`: idiomatic British English, same claims, same structure. Reuse the English wording of the matching design pages (`src/designs/en/`).

## 6. Check and open the PR

```bash
npm run build && npm run test:unit && npm run check:copy
```

Fix every error the build reports (it names the file). Playwright runs in CI; run `npx playwright test interactions` locally only if the browsers are already installed. Then commit both files and open a PR:

- Title: `content: <German title>`
- Body: both URLs, the German text in full, the claims list with their sources, and a note if the nav "Neu" popover should change.

Show the founder the PR link and the German text. Merge only after CI is green; the deploy runs on merge, and the nightly build at 01:15 UTC picks up expiry dates.

## Editing without Claude

Any item can be changed in GitHub's web editor: open the file, edit, "Commit changes" on a new branch, open the PR. The build rejects broken files with a readable message.
