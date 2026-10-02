// Keyboard and screen-reader behaviour the DEV notes ask for, added on top of the approved
// markup without changing it (event delegation, so it works before and after hydration).
// - "Lösungen" menu (.cl-dd): aria-expanded follows hover/focus, Esc closes, arrow keys move.
// - Mobile menu (<details class="cl-mnav">) and news popover close on Esc.

const menus = () => document.querySelectorAll('.cl-dd');
const items = (dd) => [...dd.querySelectorAll('.cl-dd-menu a')];
const sync = () => menus().forEach((dd) => {
  const open = !dd.classList.contains('cl-dd-closed') && (dd.matches(':hover') || dd.matches(':focus-within'));
  dd.querySelector('.cl-ddbtn')?.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.addEventListener('focusin', sync);
document.addEventListener('focusout', () => setTimeout(sync, 0));
document.addEventListener('mouseover', (e) => { if (e.target.closest?.('.cl-dd')) sync(); });
document.addEventListener('mouseout', (e) => {
  const dd = e.target.closest?.('.cl-dd');
  if (dd && !dd.contains(e.relatedTarget)) { dd.classList.remove('cl-dd-closed'); setTimeout(sync, 0); }
});

document.addEventListener('keydown', (e) => {
  const dd = e.target.closest?.('.cl-dd');
  if (e.key === 'Escape') {
    if (dd) { dd.classList.add('cl-dd-closed'); dd.querySelector('.cl-ddbtn')?.focus(); sync(); return; }
    const det = document.querySelector('details.cl-mnav[open]');
    if (det) { det.open = false; det.querySelector('summary')?.focus(); return; }
    const pop = document.getElementById('news-pop');
    if (pop) document.querySelector('[aria-controls="news-pop"]')?.click();
    return;
  }
  if (!dd) return;
  const list = items(dd);
  const i = list.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); dd.classList.remove('cl-dd-closed'); (list[i + 1] || list[0])?.focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? list[i - 1] : list[list.length - 1])?.focus(); }
  else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cl-ddbtn')) { e.preventDefault(); dd.classList.remove('cl-dd-closed'); list[0]?.focus(); }
  else if (e.key === 'Home' && i >= 0) { e.preventDefault(); list[0]?.focus(); }
  else if (e.key === 'End' && i >= 0) { e.preventDefault(); list[list.length - 1]?.focus(); }
});
document.addEventListener('focusout', (e) => {
  const dd = e.target.closest?.('.cl-dd');
  if (dd && !dd.contains(e.relatedTarget)) dd.classList.remove('cl-dd-closed');
});

// ---------------------------------------------------------------------------------------------
// Easter eggs. Nothing here changes the page until someone goes looking.
const EN = document.documentElement.lang === 'en';

// 1) A note for people who open the developer tools.
if (!window.__clConsole) {
  window.__clConsole = true;
  const mark = [
    '   ████████    ',
    ' ████    ████  ',
    '████           ',
    '████           ',
    ' ████    ████  ',
    '   ████████  ██',
  ].join('\n');
  const lines = EN
    ? ['Reading source code? Then we speak the same language.', 'Your AI can query verified lease data through our MCP server: https://www.clearlea.se/en/ai-teams/#mcp', 'Want to build this with us? Open applications to hello@clearlea.se']
    : ['Sie lesen Quellcode? Dann sprechen wir dieselbe Sprache.', 'Ihre KI fragt geprüfte Mietvertragsdaten über unseren MCP-Server ab: https://www.clearlea.se/ki-teams/#mcp', 'Lust, das mit uns zu bauen? Initiativbewerbung an hello@clearlea.se'];
  console.log('%c' + mark, 'color:#13293d;font-family:monospace;line-height:1.1');
  console.log('%c' + lines[0], 'color:#13293d;font:600 14px Montserrat,system-ui,sans-serif');
  console.log('%c' + lines[1] + '\n' + lines[2], 'color:#43586c;font:13px Montserrat,system-ui,sans-serif');
}

// 2) Nachtrag 7: "Die Wahrheit steht in Nachtrag 7." Type "nachtrag" (EN: "amendment") anywhere,
//    or click the brand dot in the hero seven times, and amendment 7 slides in.
const TEXT = EN
  ? { kicker: 'Amendment 7 · valid from today', title: '§ 1 Reading between the lines', body: 'Whoever reads this far reads amendments too. You bring the coffee to our first call, we bring the contract history.', source: 'Source: Amendment 7, page 1, § 1', cta: 'Book a call', href: '/en/call/', close: 'Close amendment 7' }
  : { kicker: 'Nachtrag 7 · gültig ab heute', title: '§ 1 Zwischen den Zeilen', body: 'Wer bis hierher liest, liest auch Nachträge. Den Kaffee zum Erstgespräch bringen Sie mit, die Vertragshistorie bringen wir.', source: 'Quelle: Nachtrag 7, Seite 1, § 1', cta: 'Gespräch vereinbaren', href: '/gespraech/', close: 'Nachtrag 7 schließen' };

let lastFocus = null;
function closeAmendment() {
  const card = document.getElementById('cl-nachtrag-7');
  if (!card) return;
  card.remove();
  lastFocus?.focus?.();
}
function openAmendment() {
  if (document.getElementById('cl-nachtrag-7')) return;
  lastFocus = document.activeElement;
  const card = document.createElement('aside');
  card.id = 'cl-nachtrag-7';
  card.className = 'cl-n7';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-labelledby', 'cl-n7-title');
  card.innerHTML = `
    <div class="cl-n7-top"><span class="cl-n7-kicker">${TEXT.kicker}</span>
      <button type="button" class="cl-n7-close" aria-label="${TEXT.close}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <p class="cl-n7-title" id="cl-n7-title">${TEXT.title}</p>
    <p class="cl-n7-body">${TEXT.body}</p>
    <div class="cl-n7-foot"><span class="cl-n7-source">${TEXT.source}</span><a class="cl-n7-cta" href="${TEXT.href}">${TEXT.cta}</a></div>`;
  document.body.appendChild(card);
  card.querySelector('.cl-n7-close').addEventListener('click', closeAmendment);
  card.querySelector('.cl-n7-close').focus({ preventScroll: true });
}

let typed = '';
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('cl-nachtrag-7')) { closeAmendment(); return; }
  const t = e.target;
  if (t.closest?.('input, textarea, select, [contenteditable="true"]') || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-9);
  if (typed.endsWith('nachtrag') || typed.endsWith('amendment')) { typed = ''; openAmendment(); }
});

let dotClicks = 0, dotTimer = null;
document.addEventListener('click', (e) => {
  if (!e.target.closest?.('.cl-glass')) return;
  dotClicks += 1;
  clearTimeout(dotTimer);
  dotTimer = setTimeout(() => { dotClicks = 0; }, 4000);
  if (dotClicks >= 7) { dotClicks = 0; openAmendment(); }
});
