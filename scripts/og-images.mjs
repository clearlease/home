// Link-preview images (Open Graph, 1200x630) per page and language: the page's own kicker and
// headline on the site's light surface, the brand "c." motif and the logo. They show when a link
// is shared on LinkedIn, WhatsApp, Teams, Slack, X and in some search features.
// Runs before every build (npm run build). Output: public/og/<lang>-<Page>.png
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from 'parse5';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ROUTES } from '../src/site.config.mjs';

const PAGES = ['Home', 'Plattform', 'Loesungen-Bestandshalter', 'Loesungen-Property', 'Loesungen-Filialisten', 'KI-Teams', 'Trust-Center', 'Ressourcen', 'Unternehmen', 'Gespraech'];
const font = (w) => readFileSync(`node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`);
const fonts = [500, 600, 700].map((weight) => ({ name: 'Montserrat', data: font(weight), weight, style: 'normal' }));
const logo = 'data:image/svg+xml;base64,' + readFileSync('public/media/clearlease-logo.svg').toString('base64');
// the brand "c" and its dot, same path and proportions as the hero motif on every page
const motif = 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 8 22 15"><path fill="rgba(19,41,61,0.06)" d="m 11.484882,21.769442 q -1.8818515,0 -3.3604495,-0.784105 -1.456195,-0.806508 -2.285106,-2.195494 -0.828911,-1.388986 -0.828911,-3.158823 0,-1.79224 0.828911,-3.158823 0.828911,-1.388986 2.285106,-2.173091 1.478598,-0.7841046 3.3604495,-0.7841046 1.747434,0 3.069211,0.7168956 1.34418,0.694493 2.038673,2.061076 l -2.150688,1.254568 q -0.537672,-0.851314 -1.321777,-1.254568 -0.761702,-0.403254 -1.657822,-0.403254 -1.030538,0 -1.8594485,0.44806 -0.828911,0.44806 -1.299374,1.299374 -0.470463,0.828911 -0.470463,1.993867 0,1.164956 0.470463,2.01627 0.470463,0.828911 1.299374,1.276971 0.8289105,0.44806 1.8594485,0.44806 0.89612,0 1.657822,-0.403254 0.784105,-0.403254 1.321777,-1.254568 l 2.150688,1.254568 q -0.694493,1.34418 -2.038673,2.083479 -1.321777,0.716896 -3.069211,0.716896 z"/><circle cx="20.6" cy="20.3" r="1.5" fill="rgba(19,41,61,0.10)"/></svg>`).toString('base64');

const el = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } });
const text = (n) => (n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join(''));
function find(n, pred) { if (pred(n)) return n; for (const c of n.childNodes || []) { const r = find(c, pred); if (r) return r; } return null; }

function heroFacts(file) {
  const doc = parse(readFileSync(file, 'utf8'));
  const h1 = find(doc, (n) => n.tagName === 'h1');
  const lines = (h1.childNodes || []).filter((c) => c.tagName === 'span').map((c) => text(c).trim());
  const title = text(h1).replace(/­/g, '').replace(/\s+/g, ' ').trim();
  const kickerEl = (h1.parentNode.childNodes || []).filter((c) => c.tagName).find((c) => c !== h1 && c.tagName === 'span');
  const kicker = kickerEl ? text(kickerEl).replace(/\s+/g, ' ').trim() : 'clearlea.se';
  return { title, lines: lines.length > 1 ? lines.map((l) => l.replace(/­/g, '')) : [title], kicker };
}

mkdirSync('public/og', { recursive: true });
for (const lang of ['de', 'en']) {
  for (const page of PAGES) {
    const { lines, kicker, title } = heroFacts(`src/designs/${lang}/${page}.dc.html`);
    const size = title.length > 60 ? 58 : title.length > 40 ? 66 : 76;
    const url = 'clearlea.se' + (ROUTES[page][lang] === '/' ? '' : ROUTES[page][lang].replace(/\/$/, ''));
    const tree = el('div', { width: 1200, height: 630, background: '#F7F7F7', position: 'relative', fontFamily: 'Montserrat', color: '#13293d' },
      { type: 'img', props: { src: motif, width: 760, height: 518, style: { position: 'absolute', right: -150, top: -40 } } },
      el('div', { flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '72px 80px 64px' },
        el('div', { flexDirection: 'column', gap: 28 },
          el('div', { alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1d6485' },
            el('div', { width: 11, height: 11, borderRadius: 9999, background: '#13293d' }), kicker),
          el('div', { flexDirection: 'column', fontSize: size, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.045em', maxWidth: 980 },
            ...lines.map((l, i) => el('div', { color: lines.length > 1 && i === 0 ? '#55636f' : '#13293d', fontWeight: lines.length > 1 && i === 0 ? 500 : 700 }, l)))),
        el('div', { alignItems: 'center', justifyContent: 'space-between' },
          { type: 'img', props: { src: logo, width: 240, height: 40 } },
          el('div', { fontSize: 22, fontWeight: 500, color: '#55636f' }, url))),
      el('div', { position: 'absolute', left: 0, bottom: 0, width: 1200, height: 10, background: '#13293d' }));
    const svg = await satori(tree, { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    writeFileSync(`public/og/${lang}-${page}.png`, png);
  }
}
console.log('og images: public/og/ (20)');
