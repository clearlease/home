// schema.org JSON-LD. Only facts that are on the approved pages.
import { SITE_URL, LINKS, route } from '../site.config.mjs';

export function organization(lang, { founders = false } = {}) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'clearlea.se',
    url: SITE_URL + route('Home', lang),
    logo: SITE_URL + '/media/clearlease-logo.svg',
    email: 'hello@clearlea.se',
    address: { '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' },
  };
  if (founders) {
    const person = (name, jobTitle, sameAs) => ({ '@type': 'Person', name, jobTitle, ...(sameAs ? { sameAs: [sameAs] } : {}) });
    org.founder = [
      person('Hieronymus Deutsch', lang === 'de' ? 'Mitgründer und CEO' : 'Co-founder and CEO', LINKS.linkedinHieronymus),
      person('Fabian Laußmann', lang === 'de' ? 'Mitgründer und CTO' : 'Co-founder and CTO', LINKS.linkedinFabian),
    ];
  }
  return org;
}

export function softwareApplication(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'clearlea.se',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: lang,
    offers: {
      '@type': 'Offer',
      price: '9.49',
      priceCurrency: 'EUR',
      description: lang === 'de' ? 'ab 9,49 € pro Standort und Monat' : 'from €9.49 per site and month',
    },
  };
}
