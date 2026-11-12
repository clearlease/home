// schema.org JSON-LD. Only facts that are on the approved pages.
import { SITE_URL, LINKS, route } from '../site.config.mjs';

export function organization(lang, { founders = false } = {}) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'clearlea.se',
    url: SITE_URL + route('Home', lang),
    logo: SITE_URL + '/media/clearlease-logo.png', // Google needs a raster logo
    description: { de: 'Operations Intelligence für Gewerbeimmobilien', en: 'Operations intelligence for commercial real estate', fr: 'Operations intelligence pour l’immobilier d’entreprise' }[lang],
    email: 'hello@clearlea.se',
    sameAs: [LINKS.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' },
  };
  if (founders) {
    const person = (name, jobTitle, sameAs) => ({ '@type': 'Person', name, jobTitle, ...(sameAs ? { sameAs: [sameAs] } : {}) });
    org.founder = [
      person('Hieronymus Deutsch', { de: 'Mitgründer und CEO', en: 'Co-founder and CEO', fr: 'Cofondateur et CEO' }[lang], LINKS.linkedinHieronymus),
      person('Fabian Laußmann', { de: 'Mitgründer und CTO', en: 'Co-founder and CTO', fr: 'Cofondateur et CTO' }[lang], LINKS.linkedinFabian),
    ];
  }
  return org;
}

// WebSite: gives Google the site name ("clearlea.se") to show above the result.
export function website(lang) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'clearlea.se', alternateName: 'clearlease', url: SITE_URL + route('Home', lang), inLanguage: lang };
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
      description: { de: 'ab 9,49 € pro Standort und Monat', en: 'from €9.49 per site and month', fr: 'à partir de 9,49 € par site et par mois' }[lang],
    },
  };
}

// NewsArticle for a Ressourcen article page.
export function newsArticle(lang, a, image) {
  const { '@context': _, ...publisher } = organization(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.text,
    datePublished: a.date,
    inLanguage: lang,
    url: SITE_URL + a.path,
    mainEntityOfPage: SITE_URL + a.path,
    image: [image],
    publisher,
  };
}
