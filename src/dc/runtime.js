// Minimal runtime for Design Component (.dc.html) pages, on top of Preact.
// A page's script defines `class Component extends DCLogic { renderVals() {...} }`;
// the compiler (src/dc/compile.mjs) turns the page template into `__tpl(scope)`.
import { Component } from 'preact';

export class DCLogic extends Component {
  render() {
    const vals = (this.renderVals && this.renderVals()) || {};
    return this.__tpl(vals);
  }
}

// Dotted lookup in the current scope. Loop scopes inherit from their parent scope
// through the prototype chain, so `item.x`, `$index` and page values all resolve.
export function L(scope, path) {
  const parts = path.split('.');
  let v = scope == null ? undefined : scope[parts[0]];
  for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
  return v;
}

export function sub(scope, name, value, index) {
  const s = Object.create(scope);
  s[name] = value;
  s.$index = index;
  return s;
}

export function str(v) {
  return v == null || v === false ? '' : String(v);
}

export function arr(v) {
  return Array.isArray(v) ? v : [];
}
