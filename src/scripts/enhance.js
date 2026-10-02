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
