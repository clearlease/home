// HTML helpers for the build scripts. They use the parse5 HTML parser instead of regular
// expressions, so comments, <script> and <style> are found the way a browser finds them and
// entities are decoded exactly once.
import { parse, parseFragment } from 'parse5';

const SKIP = new Set(['script', 'style', 'svg', 'template']);

function walk(node, visit) {
  for (const c of node.childNodes || []) {
    if (visit(c) !== false) walk(c.content || c, visit);
  }
}

// `src` without its HTML comments. Everything else stays byte for byte.
export function stripComments(src) {
  const cuts = [];
  walk(parse(src, { sourceCodeLocationInfo: true }), (n) => {
    if (n.nodeName === '#comment' && n.sourceCodeLocation) cuts.push([n.sourceCodeLocation.startOffset, n.sourceCodeLocation.endOffset]);
  });
  let out = src;
  for (const [a, b] of cuts.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + out.slice(b);
  return out;
}

// Visible text of an HTML fragment, entities decoded. Elements are separated by `sep`;
// elements in `breakAfter` end with a newline instead. <script>, <style>, <svg> are left out
// unless `keep` names them.
export function textOf(html, { sep = ' ', breakAfter = new Set(), keep = new Set() } = {}) {
  let out = '';
  const visit = (n) => {
    if (n.nodeName === '#text') { out += n.value; return; }
    if (!n.tagName) return;
    if (SKIP.has(n.tagName) && !keep.has(n.tagName)) return false;
    out += sep;
    walk(n.content || n, visit);
    out += breakAfter.has(n.tagName) ? '\n' : sep;
    return false;
  };
  walk(/<html[\s>]/i.test(html) ? parse(html) : parseFragment(html), visit);
  return out;
}
