# Ressourcen: tiles, articles, filters, feed

Every item on `/ressourcen/` and `/en/resources/` is a pair of Markdown files with the same number:

```
src/content/ressourcen/de/02-mcp-server-clearlea-se-als-quelle.md
src/content/ressourcen/en/02-mcp-server-clearlea-se-as-source.md
```

The number pairs the two languages. The rest of the file name is the URL slug.

## Tile or article

- **Frontmatter only:** a tile that links to `href` (a page, an anchor such as `#indexrechner`, or an external URL).
- **Text below the frontmatter:** an article with its own page, `/ressourcen/<slug>/` and `/en/resources/<slug>/`. The tile links there, and `href` becomes the "Mehr erfahren" link at the end. Articles need `date: YYYY-MM-DD`.

Fields are described in `src/content.config.ts`. Dated items come first in the list (newest first), then undated ones by `order`.

## What the build checks

`src/lib/articles.mjs` stops the build with a list of problems when:

- a number has no twin in the other language, or appears twice;
- one language has article text and the other does not;
- `cat`, `date`, `until` or `neu` differ between the two languages;
- an article has no `date`, or its slug is `news`, `produkt-updates`, `werkzeuge`, `product-updates`, `tools` or `feed.xml`;
- article text contains raw HTML, a `.dc.html` link, or a link into the other language.

## Generated pages

`node scripts/gen-pages.mjs` writes them; do not edit `src/pages/` by hand.

| Page | German | English |
|------|--------|---------|
| Article | `/ressourcen/<slug>/` | `/en/resources/<slug>/` |
| Filter | `/ressourcen/news/`, `/produkt-updates/`, `/werkzeuge/` | `/en/resources/news/`, `/product-updates/`, `/tools/` |
| RSS feed | `/ressourcen/feed.xml` | `/en/resources/feed.xml` |

Articles use the nav and footer shell (`Shell.dc.html`) with the prose styles of the legal pages. `npm run build` also renders a link-preview image per article into `public/og/`.

## Expiry

`until:` removes the tile and the feed entry after that day (nightly build, see `docs/events.md`). An article page stays online, so shared links keep working.

## Writing a new item

Ask Claude Code for "neuer Beitrag" (skill: `.claude/skills/ressourcen-beitrag/`). It drafts both languages, checks brand voice and claims, builds and opens a PR. Without Claude: edit or add the files in GitHub's web editor and open a PR; the build checks the rules above.

## Not automatic

The nav "Neu" popover is hardcoded in every design. New items do not appear there until someone edits the designs. To link an entry to an article, write `href="[RESSOURCE-02]"` (the item number): the compiler turns it into the article URL in the page language and stops the build if that item has no article text.
