---
cat: "News"
title: "PHP2Shell: Was wir geprüft und geändert haben"
text: "clearlea.se nutzt kein PHP. Trotzdem prüfen wir unsere gesamte Infrastruktur und sichern sie weiter ab."
neu: true
href: "Trust-Center.dc.html"
date: "2026-10-22"
---

Am 21. Oktober 2026 hat PHP zwei kritische Sicherheitslücken geschlossen, bekannt als „PHP2Shell“ (CVE-2026-109618 und CVE-2026-109619, CVSS 9,2). Sie erlauben Angreifern, ohne Anmeldung eigenen Code auf einem Server auszuführen. Die Details kursierten schon vor der geplanten Veröffentlichung, erste Angriffsversuche gab es noch vor den Patches.

PHP läuft auf rund 69 % aller Websites, deren Serversprache bekannt ist. Hier lesen Sie, was das für clearlea.se bedeutet.

## Unser Produkt nutzt kein PHP

Die Anwendung und ihre Softwarekomponenten enthalten kein PHP. Das haben wir auf Architekturebene und an den tatsächlich ausgerollten Paketen geprüft. Die Kundenumgebungen sind nicht betroffen: Die verwalteten Cloud-Dienste darunter betreibt und aktualisiert der Cloud-Anbieter.

## Wir prüfen trotzdem alles

Kein PHP im Produkt heißt für uns nicht: nicht hinsehen. Wir prüfen unsere gesamte Infrastruktur, Umgebung für Umgebung: Container und Prozesse, Anmeldungen und Schlüssel, geänderte Systemdienste, Dateien und gespeicherte Daten, Protokolle und Firewall.

**Ergebnis bisher:** kein Hinweis auf eine Kompromittierung.

Die Prüfung unserer Produktionsumgebung läuft. Das Ergebnis ergänzen wir hier.

## Was wir ändern

- Wir sichern Admin-Zugänge zusätzlich ab.
- Wir schränken Server-Zugänge weiter ein.
- Wir protokollieren Webzugriffe und bewahren die Protokolle auf.
- Wir richten regelmäßige Backups ein, als Vergleichsstand für künftige Prüfungen.
- Wir prüfen, ob Passwörter und Schlüssel der Produktion neu vergeben werden müssen.

Fragen zu unserer Sicherheit beantworten wir gern unter [hello@clearlea.se](mailto:hello@clearlea.se).

## Quellen

- [SecurityWeek](https://www.securityweek.com/php2shell-mass-exploitation-looms-for-leaked-critical-php-flaws/): Schweregrad, Leak vor der Veröffentlichung, Angriffsversuche
- [watchTowr](https://watchtowr.com/intelligence/php-cve-2026-109618-faq/): behoben in PHP 8.5.12, 8.4.27, 8.3.36 und 8.2.35
- [Cloudflare](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/): betroffen ist PHP 5.4 und neuer
- [W3Techs](https://w3techs.com/technologies/details/pl-php): Verbreitung von PHP
