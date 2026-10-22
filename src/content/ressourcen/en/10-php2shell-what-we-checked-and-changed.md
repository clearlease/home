---
cat: "News"
title: "PHP2Shell: what we checked and changed"
text: "clearlea.se uses no PHP. One tool in our deployment infrastructure does. We patched and checked it the same day."
neu: true
href: "Trust-Center.dc.html"
date: "2026-10-22"
---

On 21 October 2026, PHP closed two critical vulnerabilities known as "PHP2Shell" (CVE-2026-109618 and CVE-2026-109619, CVSS 9.2). They let attackers run their own code on a server without logging in. The details leaked before the planned disclosure, and the first attack attempts came before the patches.

PHP runs on about 69% of all websites whose server language is known. Here is what that means for clearlea.se.

## Our product uses no PHP

The application and its software components contain no PHP. We checked this at architecture level and against the packages actually deployed. Customer environments are not affected: the cloud provider runs and updates the managed cloud services underneath.

## One tool in our infrastructure does

One tool in our deployment infrastructure runs on PHP. We patched it on 21 October, the day the patches came out. We then checked the server it runs on: containers and processes, logins and keys, changed system services, files and stored data, logs and firewall.

**Result:** we found no sign of compromise. Even so, we cannot fully rule out earlier exploitation, because older logs were lost during the update. We would rather say so openly.

We are running the same check on our production environment and will add the result here.

## What we are changing

- We are adding further protection to access to our deployment tools.
- We are restricting server access further.
- We log web access and keep the logs.
- We are setting up regular backups as a baseline for future checks.
- We are checking whether production passwords and keys need to be replaced.

Questions about our security? Write to [hello@clearlea.se](mailto:hello@clearlea.se).

## Sources

- [SecurityWeek](https://www.securityweek.com/php2shell-mass-exploitation-looms-for-leaked-critical-php-flaws/): severity, leak before disclosure, attack attempts
- [watchTowr](https://watchtowr.com/intelligence/php-cve-2026-109618-faq/): fixed in PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35
- [Cloudflare](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/): PHP 5.4 and later is affected
- [W3Techs](https://w3techs.com/technologies/details/pl-php): how widely PHP is used
