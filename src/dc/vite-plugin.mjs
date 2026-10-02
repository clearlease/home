// Vite plugin: `import Page, { meta } from './designs/de/Home.dc.html?dc'` returns the compiled
// Preact page; `import './designs/de/Home.dc.html?dccss&lang.css'` returns its <helmet> CSS.
// The page language is taken from the folder (designs/de, designs/en).
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDC } from './compile.mjs';

const RUNTIME = fileURLToPath(new URL('./runtime.js', import.meta.url));
const SLOTS = { 'cal-embed': fileURLToPath(new URL('../islands/CalEmbed.jsx', import.meta.url)) };

function compileFile(file) {
  const lang = /[\\/]designs[\\/]en[\\/]/.test(file) ? 'en' : 'de';
  const page = basename(file, '.dc.html');
  const out = compileDC(readFileSync(file, 'utf8'), { lang, page, file: `${lang}/${page}.dc.html`, runtimeId: '@dc/runtime', slotId: (n) => '@dc/slot/' + n });
  for (const w of new Set(out.warnings)) console.warn(`[dc] ${lang}/${page}: ${w}`);
  return out;
}

export default function dcPages() {
  return {
    name: 'clearlease-dc-pages',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@dc/runtime') return RUNTIME;
      if (id.startsWith('@dc/slot/')) return SLOTS[id.slice(9)];
      return null;
    },
    load(id) {
      const [file, query = ''] = id.split('?');
      if (!file.endsWith('.dc.html')) return null;
      if (query === 'dc') {
        this.addWatchFile(file);
        return { code: compileFile(file).code, map: null };
      }
      if (query.startsWith('dccss')) {
        this.addWatchFile(file);
        return compileFile(file).css;
      }
      return null;
    },
  };
}
