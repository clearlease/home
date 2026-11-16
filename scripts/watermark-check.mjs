// Checks a suspected copy of our privacy policy for the invisible watermark (src/lib/watermark.mjs).
// Usage: node scripts/watermark-check.mjs https://example.com/datenschutz   or   a local .html/.txt file
import { readFileSync } from 'node:fs';
import { findMarks } from '../src/lib/watermark.mjs';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/watermark-check.mjs <url or file>'); process.exit(2); }
const text = /^https?:\/\//.test(src) ? await (await fetch(src)).text() : readFileSync(src, 'utf8');
const marks = findMarks(text);
console.log(`${marks.length} watermark characters found in ${src}`);
for (const m of marks.slice(0, 10)) console.log(`  ${m.char}: …${m.context}…`);
// One or two can be chance (a pasted Cyrillic letter); dozens mean the text was copied from clearlea.se.
process.exit(marks.length ? 0 : 1);
