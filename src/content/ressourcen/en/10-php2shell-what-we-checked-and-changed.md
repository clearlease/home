---
cat: "News"
title: "PHP2Shell: what we checked"
text: "clearlea.se uses no PHP. Because we take security seriously, we checked our entire infrastructure."
neu: true
href: "Trust-Center.dc.html"
date: "2026-10-22"
image: "/media/ressourcen/php2shell.png"
imageAlt: "Open padlock next to the word PHP2Shell, rated critical at CVSS 9.2, with the identifiers CVE-2026-109618 and CVE-2026-109619"
---

On 21 October 2026, PHP closed two critical vulnerabilities known as "PHP2Shell" (CVE-2026-109618 and CVE-2026-109619, CVSS 9.2). They let attackers run their own code on a server without logging in. The details leaked before the planned disclosure, and the first attack attempts came before the patches.

PHP runs on about 69% of all websites whose server language is known. Here is what that means for clearlea.se.

## Our product uses no PHP

The application and its software components contain no PHP. We checked this at architecture level and against the packages actually deployed. Customer environments are not affected: the cloud provider runs and updates the managed cloud services underneath.

## We check thoroughly

When a critical vulnerability appears, we do not rely on assumptions. We checked our entire infrastructure, environment by environment: containers and processes, logins and keys, changed system services, files and stored data, logs and firewall.

**Result:** no sign of compromise.

## What we already have

For us, security does not start with the next patch. These layers of protection are built into clearlea.se:

- **Documents encrypted twice.** Disk encryption only protects a server while it is switched off. While it runs, the disk is unlocked. That is why we also encrypt every document inside the application. An unlocked drive alone does not give away your documents.
- **Your own keys.** On request, we encrypt with your own keys, connected to your key vault. Then not even we have access.
- **A dedicated instance per customer.** Separate hardware, no shared database, plus strict client separation within the instance.
- **Private cloud or on-premise, also behind your firewall.** clearlea.se can run in your cloud or on your servers, up to fully isolated operation.
- **Your own language model, your own API keys.** Connect your own model or use AI on GPU servers in Germany. No training on your data.
- **Least privilege, complete audit trail.** Everyone sees only what they are allowed to see. Every access by people, AI and systems is logged.
- **Data centres in Germany.** ISO 27001-certified.

For your IT security, this means a gap in a single component does not automatically open access to your data.

Questions about our security? Write to [hello@clearlea.se](mailto:hello@clearlea.se).

## Sources

- [SecurityWeek](https://www.securityweek.com/php2shell-mass-exploitation-looms-for-leaked-critical-php-flaws/): severity, leak before disclosure, attack attempts
- [watchTowr](https://watchtowr.com/intelligence/php-cve-2026-109618-faq/): fixed in PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35
- [Cloudflare](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/): PHP 5.4 and later is affected
- [W3Techs](https://w3techs.com/technologies/details/pl-php): how widely PHP is used
