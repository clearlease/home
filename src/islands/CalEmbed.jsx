// Inline Cal.com booker for the "clearlea.se Demo" event (cal.com/deutsch/demo), as the
// Gespräch page DEV note specifies: month view, brand colour #13293D, light theme, 30 min.
// Server render and no-JS fallback: a plain link to the booking page.
import { useEffect, useRef } from 'preact/hooks';

const CAL_LINK = 'deutsch/demo';
const TEXT = {
  de: { loading: 'Kalender wird geladen …', fallback: 'Freie Termine auf cal.com ansehen' },
  en: { loading: 'Loading the calendar …', fallback: 'See free slots on cal.com' },
};

function loadCal() {
  // Official Cal.com embed loader (https://cal.com/docs/core-features/embed), unchanged.
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
  return window.Cal;
}

export default function CalEmbed({ lang = 'de' }) {
  const ref = useRef(null);
  const t = TEXT[lang] || TEXT.de;
  useEffect(() => {
    if (!ref.current || ref.current.dataset.ready) return;
    ref.current.dataset.ready = '1';
    ref.current.innerHTML = '';
    const Cal = loadCal();
    Cal('init', 'demo', { origin: 'https://app.cal.com' });
    const params = new URLSearchParams(window.location.search);
    const config = { layout: 'month_view', theme: 'light', duration: 30 };
    // ?thema=… from KI-Teams / Trust Center links pre-fills the booking reason.
    const thema = params.get('thema');
    const dok = params.get('dok');
    if (thema) config.reason = dok ? `${thema}: ${dok}` : thema;
    Cal.ns.demo('inline', { elementOrSelector: ref.current, calLink: CAL_LINK, config });
    Cal.ns.demo('ui', { theme: 'light', cssVarsPerTheme: { light: { 'cal-brand': '#13293D' } }, hideEventTypeDetails: false, layout: 'month_view' });
  }, []);
  return (
    <div ref={ref} data-cal-embed style="width: 100%; min-height: 560px; overflow: auto">
      <p style="margin: 0; padding: 28px; font-size: 15px; color: #43586c">
        {t.loading}{' '}
        <a href={`https://cal.com/${CAL_LINK}?duration=30`} target="_blank" rel="noopener" style="font-weight: 600">{t.fallback}</a>
      </p>
    </div>
  );
}
