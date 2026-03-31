#!/usr/bin/env python3
"""
translation-sync: Check i18n key consistency across HTML pages and locale files.

Usage: python3 .claude/skills/translation-sync/check-translations.py
Run from the repo root.
"""

import json
import re
import sys
from pathlib import Path

# Keys intentionally loaded from JavaScript (not data-i18n attributes).
# These must stay in all locale files but will not appear in HTML scans.
JS_DYNAMIC_KEYS = {
    "christmas.banner",
    "pmLanding.slide6.animated.1",
    "pmLanding.slide6.animated.2",
    "pmLanding.slide6.animated.3",
    "pmLanding.slide6.animated.4",
}

LOCALE_FILES = [
    Path("locales/de.json"),
    Path("locales/en.json"),
    Path("locales/nl.json"),
    Path("locales/fr.json"),
]

# HTML files to scan. _template.html is intentionally excluded (scaffold only).
HTML_FILES = [Path("index.html")] + [
    p for p in Path("landings").glob("*.html")
    if p.name != "_template.html"
]


def extract_html_keys(html_files):
    """Return set of all data-i18n and data-i18n-placeholder keys used in HTML."""
    pattern = re.compile(r'data-i18n(?:-placeholder)?="([^"]+)"')
    keys = set()
    for path in html_files:
        text = path.read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            keys.add(match.group(1))
    return keys


def load_locale(path):
    """Return dict of keys from a locale JSON file."""
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def run():
    root = Path(".")
    if not Path("locales").exists():
        print("ERROR: Run from the repo root (locales/ directory not found).")
        sys.exit(1)

    html_keys = extract_html_keys(HTML_FILES)
    locales = {p.stem: load_locale(p) for p in LOCALE_FILES}

    all_locale_keys = set()
    for data in locales.values():
        all_locale_keys.update(data.keys())

    # Keys used in HTML but missing from one or more locales
    missing = {}
    for key in sorted(html_keys):
        absent_in = [lang for lang, data in locales.items() if key not in data]
        if absent_in:
            missing[key] = absent_in

    # Keys in locale files but not in HTML (excluding known JS-dynamic keys)
    all_html_and_dynamic = html_keys | JS_DYNAMIC_KEYS
    orphaned = sorted(all_locale_keys - all_html_and_dynamic)

    # Keys only in some locales, not all (consistency issue)
    inconsistent = {}
    for key in sorted(all_locale_keys - JS_DYNAMIC_KEYS):
        absent_in = [lang for lang, data in locales.items() if key not in data]
        if absent_in:
            inconsistent[key] = absent_in

    # --- Output ---
    ok = True

    print(f"\n📋 Translation Sync Report")
    print(f"   HTML files scanned : {len(HTML_FILES)}")
    print(f"   HTML keys found    : {len(html_keys)}")
    print(f"   Locale files       : {', '.join(locales.keys())}")

    if missing:
        ok = False
        print(f"\n❌ MISSING KEYS ({len(missing)}) — used in HTML but absent from locale(s):")
        for key, langs in missing.items():
            print(f"   {key}  →  missing from: {', '.join(langs)}")
    else:
        print(f"\n✅ No missing keys — all {len(html_keys)} HTML keys are present in all locales.")

    if orphaned:
        print(f"\n⚠️  ORPHANED KEYS ({len(orphaned)}) — in locale files but not in any HTML:")
        for key in orphaned:
            present_in = [lang for lang, data in locales.items() if key in data]
            print(f"   {key}  (in: {', '.join(present_in)})")
        print("   → These may be safe to remove, or are used via JavaScript.")
        print("     If used via JS, add them to JS_DYNAMIC_KEYS in this script.")
    else:
        print(f"\n✅ No orphaned keys.")

    if JS_DYNAMIC_KEYS:
        print(f"\nℹ️  JS-dynamic keys (excluded from orphan check): {len(JS_DYNAMIC_KEYS)}")
        for key in sorted(JS_DYNAMIC_KEYS):
            print(f"   {key}")

    print()
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    run()
