// Compiles a Design Component page (.dc.html, as exported from the Claude Design canvas)
// into an ES module that renders the same markup with Preact and runs the page's own
// `class Component extends DCLogic` logic. Layout, copy and behaviour stay exactly as designed.
//
// What it does on top of a 1:1 translation:
// - drops <helmet> (its CSS is returned separately), DEV comments and canvas-only attributes;
// - rewrites links: `Page.dc.html` (+ data-anchor) -> production route for the page language,
//   legal paths -> localized legal routes, `/en` (in DE files) or `/de` (in EN files) -> this
//   page in the other language, [APP-URL] / [LINKEDIN-*] -> values from src/site.config.mjs;
// - rewrites canvas images /_blob/<id> -> /media/<name>.webp|svg.
import { parse } from 'parse5';
import { fileURLToPath } from 'node:url';
import { ROUTES, LEGAL_HREFS, LINKS, route, otherLang, buildDay } from '../site.config.mjs';
import { mediaPath } from './media.mjs';

const BOOL_ATTRS = new Set(['disabled', 'open', 'checked', 'selected', 'hidden', 'required', 'readonly', 'multiple', 'autofocus', 'novalidate', 'inert']);
const DROP_ATTRS = new Set(['hint-placeholder-val', 'hint-placeholder-count', 'hint-size', 'data-anchor', 'data-until', 'data-from', 'data-slot']);
// data-slot="name": the element keeps its own attributes, its children are replaced by this component.
export const SLOTS = { 'cal-embed': fileURLToPath(new URL('../islands/CalEmbed.jsx', import.meta.url)) };
// data-until="YYYY-MM-DD": the element is left out of builds after that day (buildDay, Europe/Berlin).
// data-from="YYYY-MM-DD": the element is left out of builds before that day (its successor, e.g. a lower count).
const EVENT_MAP = { onfocus: 'onfocusin', onblur: 'onfocusout' };
const HOLE = /{{\s*([^}]+?)\s*}}/g;
const WS = /[ \t\n\r\f]+/g;
// Pages outside the route map (the shell used for legal pages, 404, articles) get the
// language-switch target from the `altHref` prop at render time.
const ALT_HREF = '\u0000ALT_HREF\u0000';

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;

// Interaction states. The designs set colours inline, so stylesheet :hover rules cannot reach
// them without a hook. Buttons and button-like links get a class from their inline style here;
// src/styles/enhance.css gives each class the design system's hover, active and focus states.
function interactionClass(node) {
  const tag = node.tagName;
  if (!['a', 'button', 'summary'].includes(tag)) return '';
  const st = (attr(node, 'style') || '').replace(/\s+/g, ' ');
  const has = (re) => re.test(st);
  if (st.includes('{{')) {
    if (tag === 'button' && (attr(node, 'aria-pressed') !== undefined || attr(node, 'role') === 'tab')) return 'cl-btn-chip';
    return '';
  }
  const pill = has(/border-radius: ?9999px/);
  if (has(/background: ?#13293d/i) && has(/color: ?#fff(fff)?\b/i)) return 'cl-btn-primary';
  if (pill && has(/border: ?1(\.5)?px solid rgba\((0, 0, 0, 0\.2|19, 41, 61, 0\.3)/)) return 'cl-btn-ghost';
  if (tag === 'a' && has(/border: ?1px solid rgba\(19, 41, 61, 0\.3\)/)) return 'cl-btn-ghost';
  if (pill && has(/background: ?#fff(fff)?\b/i)) return 'cl-btn-light';
  if (pill && has(/background: ?#eff6fa/i)) return 'cl-btn-tint';
  if (tag === 'summary' && has(/box-shadow: ?inset/)) return 'cl-btn-icon';
  if (tag === 'a' && has(/border-radius: ?8px/) && has(/background: ?#(F7F7F7|eff6fa)/i)) return 'cl-tile';
  if (tag === 'a' && !has(/background/) && (node.childNodes || []).some((c) => c.tagName === 'svg') && has(/text-decoration: ?none/)) return 'cl-link-arrow';
  return '';
}
const elementChildren = (node) => (node.childNodes || []).filter((n) => n.tagName);

function find(node, pred) {
  if (pred(node)) return node;
  for (const c of node.childNodes || []) {
    const r = find(c, pred);
    if (r) return r;
  }
  return null;
}

function textOf(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(textOf).join('');
}

// Code for one `{{expr}}`: a literal, or a scope lookup.
function exprCode(expr) {
  if (/^(true|false|null)$/.test(expr) || /^-?\d+(\.\d+)?$/.test(expr)) return expr;
  if (/^'[^']*'$|^"[^"]*"$/.test(expr)) return JSON.stringify(expr.slice(1, -1));
  if (!/^[\w$]+(\.[\w$]+)*$/.test(expr)) throw new Error(`Unsupported template expression {{${expr}}}`);
  return `L(s,${JSON.stringify(expr)})`;
}

// Code for an attribute/text value: whole-value hole keeps the raw value, mixed text concatenates.
function valueCode(raw, { whole = true } = {}) {
  const holes = [...raw.matchAll(HOLE)];
  if (!holes.length) return JSON.stringify(raw);
  if (whole && holes.length === 1 && holes[0][0] === raw.trim()) return exprCode(holes[0][1]);
  const parts = [];
  let last = 0;
  for (const m of holes) {
    if (m.index > last) parts.push(JSON.stringify(raw.slice(last, m.index)));
    parts.push(`str(${exprCode(m[1])})`);
    last = m.index + m[0].length;
  }
  if (last < raw.length) parts.push(JSON.stringify(raw.slice(last)));
  return parts.join('+');
}

export function compileDC(source, { lang, page, file = page + '.dc.html', runtimeId = new URL('./runtime.js', import.meta.url).pathname, slotId = (n) => SLOTS[n] }) {
  const doc = parse(source);
  const xdc = find(doc, (n) => n.tagName === 'x-dc');
  if (!xdc) throw new Error(`${file}: no <x-dc> root`);
  const script = find(doc, (n) => n.tagName === 'script' && n.attrs?.some((a) => a.name === 'data-dc-script'));

  // Sanity check: <sc-*> inside tables would be foster-parented by the HTML parser.
  for (const tag of ['sc-for', 'sc-if']) {
    const inSource = source.split('<' + tag).length - 1;
    let parsed = 0;
    (function walk(n) { if (n.tagName === tag) parsed++; (n.childNodes || []).forEach(walk); })(xdc);
    if (inSource !== parsed) throw new Error(`${file}: <${tag}> count changed while parsing (${inSource} vs ${parsed})`);
  }

  const css = [];
  const warnings = [];
  const slotImports = new Set();
  const today = buildDay();
  const other = otherLang(lang);

  function rewriteHref(href, anchor) {
    const pageLink = href.match(/^([\w-]+)\.dc\.html(#.*)?$/);
    if (pageLink) {
      if (!ROUTES[pageLink[1]]) throw new Error(`${file}: link to unknown page ${href}`);
      return route(pageLink[1], lang) + (anchor ? '#' + anchor : pageLink[2] || '');
    }
    if (LEGAL_HREFS[href]) return route(LEGAL_HREFS[href], lang);
    if ((lang === 'de' && href === '/en') || (lang === 'en' && href === '/de')) return ROUTES[page] ? route(page, other) : ALT_HREF;
    if (href === '[APP-URL]') return LINKS.appUrl || (warnings.push('[APP-URL] not set'), href);
    const li = href.match(/^\[LINKEDIN(?:-([A-Z]+))?\]$/);
    if (li) {
      const key = li[1] ? 'linkedin' + li[1][0] + li[1].slice(1).toLowerCase() : 'linkedin';
      return LINKS[key] || (warnings.push(`${href} not set (LINKS.${key})`), href);
    }
    return href;
  }

  function attrsCode(node) {
    const entries = [];
    const anchor = attr(node, 'data-anchor');
    const extra = interactionClass(node);
    if (extra && attr(node, 'class') === undefined) entries.push(`"class":${JSON.stringify(extra)}`);
    for (const { name, value } of node.attrs || []) {
      if (DROP_ATTRS.has(name)) continue;
      let v = value;
      if (name === 'href' && !v.includes('{{')) v = rewriteHref(v, anchor);
      if (name === 'href' && v.includes('{{')) { entries.push(`"href":__href(${valueCode(v)})`); continue; }
      if (name === 'src' && v.includes('{{')) warnings.push(`src with a template value: ${v}`);
      if (name === 'src' && v.startsWith('/_blob/')) v = mediaPath(v.slice(7, 39));
      let key = name;
      if (name.startsWith('on')) {
        key = EVENT_MAP[name] || name;
        if (name === 'onchange' && (node.tagName === 'input' || node.tagName === 'textarea')) key = 'oninput';
        entries.push(`${JSON.stringify(key)}:${valueCode(v)}`);
        continue;
      }
      if (BOOL_ATTRS.has(name) && v === '') { entries.push(`${JSON.stringify(key)}:true`); continue; }
      if (name === 'class' && extra) v = `${v} ${extra}`;
      entries.push(v === ALT_HREF ? `${JSON.stringify(key)}:(this.props.altHref||"/")` : `${JSON.stringify(key)}:${valueCode(v)}`);
    }
    // the language switch link carries hreflang for crawlers and screen readers
    const href = attr(node, 'href');
    if (node.tagName === 'a' && ((lang === 'de' && href === '/en') || (lang === 'en' && href === '/de'))) {
      entries.push(`"hreflang":${JSON.stringify(other)}`, `"lang":${JSON.stringify(other)}`);
    }
    return entries.length ? `{${entries.join(',')}}` : 'null';
  }

  function childrenCode(node) {
    return (node.childNodes || []).map(nodeCode).filter(Boolean);
  }

  function nodeCode(node) {
    if (node.nodeName === '#comment') return null;
    if (node.nodeName === '#text') {
      const t = node.value.replace(WS, ' ');
      if (t === '') return null;
      return valueCode(t, { whole: false });
    }
    const tag = node.tagName;
    const until = attr(node, 'data-until');
    if (until && today > until) return null;
    const from = attr(node, 'data-from');
    if (from && today < from) return null;
    const slot = attr(node, 'data-slot');
    if (slot === 'children') return `h(${JSON.stringify(tag)},${attrsCode(node)},this.props.children)`;
    if (slot) {
      if (!SLOTS[slot]) throw new Error(`${file}: unknown data-slot "${slot}"`);
      slotImports.add(slot);
      return `h(${JSON.stringify(tag)},${attrsCode(node)},h(__slot_${slot.replace(/\W/g, '_')},{lang:${JSON.stringify(lang)}}))`;
    }
    if (tag === 'helmet') {
      for (const c of elementChildren(node)) if (c.tagName === 'style') css.push(textOf(c));
      return null;
    }
    if (tag === 'script' || tag === 'link' || tag === 'meta') {
      warnings.push(`<${tag}> inside the template was dropped`);
      return null;
    }
    if (tag === 'sc-for') {
      const list = attr(node, 'list');
      const as = attr(node, 'as') || 'item';
      const kids = childrenCode(node);
      return `arr(${valueCode(list)}).map((__v,__i)=>((s)=>[${kids.join(',')}])(sub(s,${JSON.stringify(as)},__v,__i)))`;
    }
    if (tag === 'sc-if') {
      const kids = childrenCode(node);
      return `(${valueCode(attr(node, 'value'))}?[${kids.join(',')}]:null)`;
    }
    const kids = childrenCode(node);
    // <style>/<title> inside svg etc. keep their raw text
    return `h(${JSON.stringify(tag)},${attrsCode(node)}${kids.length ? ',' + kids.join(',') : ''})`;
  }

  const roots = childrenCode(xdc);
  const scriptText = script ? textOf(script) : 'class Component extends DCLogic {}';
  let defaults = {};
  const propsRaw = script && attr(script, 'data-props');
  if (propsRaw) {
    for (const [k, v] of Object.entries(JSON.parse(propsRaw))) if (!k.startsWith('$') && v && 'default' in v) defaults[k] = v.default;
  }

  // Facts for <head>: hero subline (meta description) and FAQ pairs (FAQPage JSON-LD).
  const heroSection = find(xdc, (n) => n.tagName === 'section' && /hero-title/.test(attr(n, 'aria-labelledby') || ''));
  const heroP = heroSection && find(heroSection, (n) => n.tagName === 'p');
  const description = heroP ? textOf(heroP).replace(/\s+/g, ' ').trim() : '';
  const h1 = find(xdc, (n) => n.tagName === 'h1');
  const faq = [];
  (function walk(n) {
    if (n.tagName === 'section' && /faq-title$/.test(attr(n, 'aria-labelledby') || '')) {
      (function pairs(m) {
        if (m.tagName === 'dt') {
          const dd = elementChildren(m.parentNode).find((x, i, all) => x.tagName === 'dd' && all.indexOf(m) < i);
          if (dd) faq.push({ q: textOf(m).replace(/\s+/g, ' ').trim(), a: textOf(dd).replace(/\s+/g, ' ').trim() });
        }
        (m.childNodes || []).forEach(pairs);
      })(n);
      return;
    }
    (n.childNodes || []).forEach(walk);
  })(xdc);

  // Runtime link rewriting for hrefs that come from page data ({{it.href}}).
  const routeTable = Object.fromEntries(Object.keys(ROUTES).map((k) => [k, route(k, lang)]));
  const slotCode = [...slotImports].map((n) => `import __slot_${n.replace(/\W/g, '_')} from ${JSON.stringify(slotId(n))};`).join('\n');
  const code = `import { h } from 'preact';
import { DCLogic, L, sub, str, arr } from ${JSON.stringify(runtimeId)};
${slotCode}
const __routes = ${JSON.stringify(routeTable)};
function __href(v) { var m = /^([\\w-]+)\\.dc\\.html(#.*)?$/.exec(v || ''); return m && __routes[m[1]] ? __routes[m[1]] + (m[2] || '') : v; }
${scriptText}
Component.prototype.__tpl = function (s) { return [${roots.join(',')}]; };
const DEFAULTS = ${JSON.stringify(defaults)};
export default function DCPage(props) { return h(Component, Object.assign({}, DEFAULTS, props)); }
export { Component as DCComponent };
export const meta = ${JSON.stringify({ page, lang, h1: h1 ? textOf(h1).replace(/\s+/g, ' ').trim() : '', description, faq })};
`;
  return { code, css: css.join('\n'), warnings };
}
