# English version: translation brief

The German designs in `src/designs/de/*.dc.html` are approved by the founder. Their English
twins in `src/designs/en/` must say the same thing, in idiomatic British English, in the
clearlea.se brand voice. English copy goes to the founder for approval before launch.

## How to translate a page

1. Copy `src/designs/de/<Page>.dc.html` to `src/designs/en/<Page>.dc.html`.
2. Change `<html lang="de">` to `<html lang="en">`.
3. Translate **only**:
   - visible text between tags;
   - the attributes `alt`, `aria-label`, `title`, `placeholder`;
   - user-visible **string literals inside the `<script data-dc-script>`** (case data, workflow
     steps, tips, labels, aria texts built in code).
4. Never change: tags, nesting, element count, `style`, `class`, `id`, `href` (one exception
   below), `src`, `data-*`, `{{holes}}`, `<sc-for>`/`<sc-if>`, the script's code structure,
   state keys or internal values (`'table'`, `'tasks'`, `'idle'`, `'proc'`, `kind: 'ai'` …).
5. **Strings used in comparisons:** if the script compares a string (for example
   `w.tag === 'Aus der Praxis'`, filter tabs `t[0] === f`, a default `s.f || 'Alle'`), translate
   **every occurrence identically**, or leave it German if it is only an internal key that is never shown.
6. The language switch: in the header and mobile menu, change `href="/en"` to `href="/de"`,
   the visible label `EN` to `DE`, `English` to `Deutsch`, and `aria-label="English version"` to
   `aria-label="Deutsche Version"`.
7. Leave HTML comments (`<!-- DEV … -->`) as they are; they never ship.
8. Verify:
   - `node scripts/check-i18n.mjs <Page>` must print `OK`;
   - `node scripts/render-design.mjs en <Page>` prints the page text. Read it once end to end.

## Brand voice (from CLAUDE.md and the Notion brand-voice rule)

- Address the reader as "you". Active voice. Lead with the reader's benefit.
- Punchy and confident, but every claim exactly as strong as the German one. Never add,
  round up or strengthen a number or claim. Keep labels such as "Pilot", "Demnächst" → "Coming soon".
- **No em dashes or en dashes as punctuation** (" — ", " – "). Use full stops, commas or colons.
  Number ranges keep a plain hyphen or "to" ("3 to 4", "2–3" → "2 to 3").
- Brand name always `clearlea.se` (lowercase, with the dot), also at the start of a sentence.
- British spelling (organise, optimise, centre, licence as noun). Sentence case for headings,
  as in German.
- Keep headline rhythm: short German fragments ("Chaos rein. Klarheit raus.") become short English
  fragments ("Chaos in. Clarity out."), not explanations.

## Formats

| German | English |
|---|---|
| 9,49 € | €9.49 |
| 18.450 € | €18,450 |
| 0,40 € | €0.40 |
| 98 % | 98% |
| +2,98 % | +2.98% |
| 120.000 Tokens | 120,000 tokens |
| 31.12.2026 (in product mocks) | 31/12/2026 |
| 5. bis 7. Oktober | 5 to 7 October |
| Mo, Di, Mi, Do, Fr, Sa, So | Mon, Tue, Wed, Thu, Fri, Sat, Sun |
| < 30 Sekunden | < 30 seconds |

Fictional people, companies, streets and cities in the product mocks stay as they are
(they are German properties). File names in mocks become English where they are meant to be
read (`Nachtrag_6_Friedrichstr.pdf` → `Amendment_6_Friedrichstr.pdf`).

## Glossary (use these terms on every page)

| German | English |
|---|---|
| Mietvertrag / Verträge | lease / leases |
| Nachtrag | amendment |
| Vertragshistorie / Nachtragskette | contract history / amendment chain |
| der gültige Stand | the current valid state |
| Beleg / mit Beleg | evidence / with evidence (source) |
| Quelle | source |
| Objekt / Objektliste | property / property list |
| Bestandshalter | owners (page: "Owners & asset management") |
| Verwalter / Property Management | property managers |
| Filialisten & Unternehmen | multi-site retailers & corporates |
| Mieter / Vermieter | tenant / landlord |
| Nebenkosten / Nebenkostenabrechnung / Nebenkostenprüfung | service charges / service charge statement / service charge audit |
| Indexmiete / Indexanpassung / Wertsicherung | index-linked rent / index adjustment / indexation clause |
| Frist / Fristen | deadline / deadlines |
| Freigabe / freigeben | approval / approve |
| Fachfreigabe | specialist approval |
| QS-Index / QS | QA index / QA |
| Schwelle | threshold |
| Workflow, Cockpit, MCP-Server | workflow, cockpit, MCP server |
| KI / KI-Assistent / KI-Agent | AI / AI assistant / AI agent |
| Mandat / Mandatsübernahme | mandate / mandate onboarding |
| Datenraum | data room |
| Sollstellung | rent debit posting |
| Übergabe (an ERP) | handover (to your ERP) |
| Eskalation / Eskalationsweg | escalation / escalation path |
| Auslöser | trigger |
| Aus der Praxis / Typischer Ablauf | From a real setup / Typical flow |
| Erledigt · protokolliert | Done · logged |
| Meine Aufgaben | My tasks |
| … brauchen Aufmerksamkeit | … need attention |
| Betriebsmodelle | deployment models |
| DSGVO | GDPR |
| Auftragsverarbeitung (AVV) | data processing agreement (DPA) |
| TOM | technical and organisational measures (TOMs) |
| Trust Center | Trust Center |
| Gewerbeimmobilien | commercial real estate |

## Shared chrome: use exactly these translations

Header and news popover:

| German | English |
|---|---|
| clearlea.se Startseite (aria) | clearlea.se home |
| Hauptnavigation (aria) | Main navigation |
| Plattform | Platform |
| Lösungen | Solutions |
| Bestandshalter & Asset Management | Owners & Asset Management |
| Ein Stand für jedes Objekt. Mit Beleg. | One valid state for every property. With evidence. |
| Property & Facility Management | Property & Facility Management |
| Neue Mandate in Tagen arbeitsfähig. | New mandates up and running in days. |
| Filialisten & Unternehmen | Multi-Site Retailers & Corporates |
| Jede Nebenkostenabrechnung geprüft, jede Frist im Blick. | Every service charge statement checked, every deadline in view. |
| Für KI- & IT-Teams | For AI & IT Teams |
| Eine Quelle, der Ihre KI trauen kann. | A source your AI can trust. |
| Für KI-Teams | For AI Teams |
| Ressourcen | Resources |
| Neu | New |
| 3 Updates (aria) | 3 updates |
| 2 Updates (aria, from 8 October) | 2 updates |
| Anmelden | Log in |
| Gespräch vereinbaren | Book a call |
| Gespräch mit Hieronymus | Talk to Hieronymus |
| Gespräch (short button) | Call |
| Menü (aria) | Menu |
| Ressourcen & News | Resources & News |
| Unternehmen | Company |
| Neuigkeiten (aria) | News |
| Neu bei clearlea.se | New at clearlea.se |
| Alle Updates → | All updates → |
| Produkt | Product |
| MCP-Server: clearlea.se als Quelle für Ihre KI | MCP server: clearlea.se as the source for your AI |
| Ihr KI-Assistent fragt den gültigen Stand ab, mit Beleg. | Your AI assistant queries the current valid state, with evidence. |
| Workflows mit 9 eingebauten Garantien | Workflows with 9 built-in guarantees |
| Prozesse prüfbar automatisieren, Schritt für Schritt. | Automate processes you can audit, step by step. |
| Event · 5. bis 7. Oktober | Event · 5 to 7 October |
| EXPO REAL 2026: Halle B3, Stand 121 | EXPO REAL 2026: Hall B3, Stand 121 |
| Mit der German PropTech Initiative. Termin am Stand buchen. | With the German PropTech Initiative. Book a meeting at the stand. |

Footer:

| German | English |
|---|---|
| Operations Intelligence für Gewerbeimmobilien. Entwickelt in Berlin. | Operations intelligence for commercial real estate. Built in Berlin. |
| Daten mit Historie | Data with history |
| Cockpit | Cockpit |
| Workflows | Workflows |
| Integrationen & MCP | Integrations & MCP |
| Über uns | About us |
| News & Produkt-Updates | News & product updates |
| Gespräch buchen | Book a call |
| © 2026 clearlea.se · Gehostet in Deutschland · DSGVO-konform · Kein KI-Training mit Ihren Daten | © 2026 clearlea.se · Hosted in Germany · GDPR-compliant · No AI training on your data |
| Impressum | Imprint |
| Datenschutz | Privacy |
| AGB | Terms |

Closing call to action (the navy block at the end of most pages):

| German | English |
|---|---|
| Nächster Schritt | Next step |
| 30 Minuten. Ihr erster Workflow. | 30 minutes. Your first workflow. |
| Sie sprechen direkt mit unserem Mitgründer und CEO. Gemeinsam finden wir den Prozess mit dem größten Hebel in Ihrem Portfolio und skizzieren den ersten Workflow für Ihr Team. Gern auch zum sicheren Einsatz von KI in Ihrem Haus. | You talk directly to our co-founder and CEO. Together we find the process with the biggest lever in your portfolio and sketch the first workflow for your team. We are also happy to talk about using AI safely in your organisation. |
| Sie sprechen mit Hieronymus Deutsch, Mitgründer und CEO. Gemeinsam finden wir den Prozess mit dem größten Hebel in Ihrem Portfolio und skizzieren den ersten Workflow für Ihr Team. | You talk to Hieronymus Deutsch, co-founder and CEO. Together we find the process with the biggest lever in your portfolio and sketch the first workflow for your team. |
| Ab 9,49 € pro Standort und Monat, Mengenrabatt möglich. Beliebig viele Nutzer, KI-Nutzung inklusive. | From €9.49 per site per month, volume discounts available. Unlimited users, AI usage included. |
| Mitgründer und CEO von clearlea.se (alt) | Co-founder and CEO of clearlea.se |
| Hieronymus Deutsch, Mitgründer und CEO von clearlea.se (alt) | Hieronymus Deutsch, co-founder and CEO of clearlea.se |
