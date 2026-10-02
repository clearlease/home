// Compiles one design and prints its server-rendered text, one block per line, so a page can be
// read end to end without a browser. Usage: node scripts/render-design.mjs <de|en> <Page> [--html]
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { renderToString } from 'preact-render-to-string';
import { h } from 'preact';
import { compileDC } from '../src/dc/compile.mjs';
import { textOf } from './lib/html.mjs';

const [lang, page, flag] = process.argv.slice(2);
if (!lang || !page) { console.error('usage: node scripts/render-design.mjs <de|en> <Page> [--html]'); process.exit(2); }
const src = readFileSync(`src/designs/${lang}/${page}.dc.html`, 'utf8');
const runtime = pathToFileURL(fileURLToPath(new URL('../src/dc/runtime.js', import.meta.url))).href;
const { code, warnings } = compileDC(src, { lang, page, runtimeId: runtime, slotId: () => 'data:text/javascript,export default function(){return null}' });
const dir = mkdtempSync(join(tmpdir(), 'dc-'));
const file = join(dir, 'page.mjs');
writeFileSync(file, code.replace("from 'preact'", `from '${import.meta.resolve('preact')}'`));
const mod = await import(pathToFileURL(file).href);
const html = renderToString(h(mod.default, {}));
rmSync(dir, { recursive: true, force: true });
for (const w of new Set(warnings)) console.error('warning:', w);
if (flag === '--html') { process.stdout.write(html + '\n'); } else {
const BLOCKS = new Set(['br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'div', 'a', 'button', 'span']);
const text = textOf(html, { sep: '', breakAfter: BLOCKS })
  .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
console.log([...text.reduce((acc, l) => (acc.at(-1) === l ? acc : (acc.push(l), acc)), [])].join('\n'));
console.log('\n--- meta:', JSON.stringify(mod.meta, null, 0).slice(0, 600));
}
