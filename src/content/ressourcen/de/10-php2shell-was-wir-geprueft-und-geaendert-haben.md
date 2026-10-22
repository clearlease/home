---
cat: "News"
title: "PHP2Shell: Was wir geprüft und geändert haben"
text: "clearlea.se nutzt kein PHP. Trotzdem haben wir unsere gesamte Infrastruktur geprüft und sichern sie weiter ab."
neu: true
href: "Trust-Center.dc.html"
date: "2026-10-22"
image: "/media/ressourcen/php2shell.png"
imageAlt: "Offenes Schloss neben dem Schriftzug PHP2Shell, eingestuft als kritisch mit CVSS 9,2, und den Kennungen CVE-2026-109618 und CVE-2026-109619"
---

Am 21. Oktober 2026 hat PHP zwei kritische Sicherheitslücken geschlossen, bekannt als „PHP2Shell“ (CVE-2026-109618 und CVE-2026-109619, CVSS 9,2). Sie erlauben Angreifern, ohne Anmeldung eigenen Code auf einem Server auszuführen. Die Details kursierten schon vor der geplanten Veröffentlichung, erste Angriffsversuche gab es noch vor den Patches.

PHP läuft auf rund 69 % aller Websites, deren Serversprache bekannt ist. Hier lesen Sie, was das für clearlea.se bedeutet.

## Unser Produkt nutzt kein PHP

Die Anwendung und ihre Softwarekomponenten enthalten kein PHP. Das haben wir auf Architekturebene und an den tatsächlich ausgerollten Paketen geprüft. Die Kundenumgebungen sind nicht betroffen: Die verwalteten Cloud-Dienste darunter betreibt und aktualisiert der Cloud-Anbieter.

## Wir haben trotzdem alles geprüft

Kein PHP im Produkt heißt für uns nicht: nicht hinsehen. Wir haben unsere gesamte Infrastruktur geprüft, Umgebung für Umgebung: Container und Prozesse, Anmeldungen und Schlüssel, geänderte Systemdienste, Dateien und gespeicherte Daten, Protokolle und Firewall.

**Ergebnis:** kein Hinweis auf eine Kompromittierung.

## Was wir schon haben

Sicherheit beginnt bei uns nicht mit dem nächsten Patch. Diese Schutzschichten sind in clearlea.se fest eingebaut:

- **Doppelt verschlüsselte Dokumente.** Festplattenverschlüsselung schützt nur, solange ein Server ausgeschaltet ist. Im laufenden Betrieb ist sie entsperrt. Deshalb verschlüsseln wir jedes Dokument zusätzlich in der Anwendung. Ein entsperrtes Laufwerk allein gibt Ihre Dokumente nicht preis.
- **Ihre eigenen Schlüssel.** Auf Wunsch verschlüsseln wir mit Ihren Schlüsseln, angebunden an Ihren Key Vault. Dann haben nicht einmal wir Zugriff.
- **Eigene Instanz pro Kunde.** Getrennte Hardware, keine geteilte Datenbank, dazu strikte Mandantentrennung innerhalb der Instanz.
- **Private Cloud oder On-Premise, auch hinter Ihrer Firewall.** clearlea.se läuft auf Wunsch in Ihrer Cloud oder auf Ihren Servern, bis hin zum vollständig isolierten Betrieb.
- **Ihr eigenes Sprachmodell, Ihre eigenen API-Schlüssel.** Sie binden Ihr Modell an oder nutzen KI auf GPU-Servern in Deutschland. Kein Training mit Ihren Daten.
- **Minimale Rechte, lückenloser Audit-Trail.** Jeder sieht nur, was er sehen darf. Jeder Zugriff von Nutzern, KI und Systemen ist protokolliert.
- **Rechenzentren in Deutschland.** ISO-27001-zertifiziert.

Für Ihre IT-Sicherheit heißt das: Eine Lücke in einer einzelnen Komponente öffnet nicht automatisch den Zugang zu Ihren Daten.

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
