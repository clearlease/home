// Site-wide settings and the route map. Every link between pages is resolved here,
// so a URL changes in one place. Canvas file names (Home.dc.html, ...) are the keys.

export const SITE_URL = 'https://www.clearlea.se';

// Launch inputs. A value of null renders the link as-is and the "no placeholder
// links" test fails, so a missing value cannot slip into production unnoticed.
export const LINKS = {
  appUrl: 'https://app.clearlea.se', // production app login for "Anmelden"
  linkedinHieronymus: null, // founder profile on the Unternehmen page (design: [LINKEDIN])
  linkedinFabian: null, // founder profile on the Unternehmen page (design: [LINKEDIN])
  calDemo: 'https://cal.com/deutsch/demo',
};

export const LANGS = ['de', 'en'];

// page key = canvas file name without .dc.html
export const ROUTES = {
  Home: { de: '/', en: '/en/' },
  Plattform: { de: '/plattform/', en: '/en/platform/' },
  'Loesungen-Bestandshalter': { de: '/loesungen/bestandshalter/', en: '/en/solutions/owners/' },
  'Loesungen-Property': { de: '/loesungen/property-management/', en: '/en/solutions/property-management/' },
  'Loesungen-Filialisten': { de: '/loesungen/filialisten/', en: '/en/solutions/multi-site/' },
  'KI-Teams': { de: '/ki-teams/', en: '/en/ai-teams/' },
  'Trust-Center': { de: '/trust-center/', en: '/en/trust-center/' },
  Ressourcen: { de: '/ressourcen/', en: '/en/resources/' },
  Unternehmen: { de: '/unternehmen/', en: '/en/company/' },
  Gespraech: { de: '/gespraech/', en: '/en/call/' },
  Impressum: { de: '/impressum/', en: '/en/imprint/' },
  Datenschutz: { de: '/datenschutz/', en: '/en/privacy/' },
  AGB: { de: '/agb/', en: '/en/terms/' },
  NotFound: { de: '/404', en: '/404' },
};

// Legal paths as the designs write them (German), mapped to page keys.
export const LEGAL_HREFS = { '/impressum': 'Impressum', '/datenschutz': 'Datenschutz', '/agb': 'AGB' };

export const route = (key, lang) => {
  const r = ROUTES[key];
  if (!r) throw new Error(`No route for page "${key}"`);
  return r[lang];
};

export const otherLang = (lang) => (lang === 'de' ? 'en' : 'de');
