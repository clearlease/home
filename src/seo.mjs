// <title> per page and language. German titles are the ones set in each design's DEV notes.
// Meta description: DESCRIPTIONS below; a page without an entry falls back to its hero subline (compile.mjs `meta`).
export const TITLES = {
  Home: {
    de: 'clearlea.se · Operations Intelligence für Gewerbeimmobilien',
    en: 'clearlea.se · Operations Intelligence for Commercial Real Estate',
  },
  Plattform: {
    de: 'Plattform: Daten mit Historie, Cockpit und KI-Workflows · clearlea.se',
    en: 'Platform: Data with History, Cockpit and AI Workflows · clearlea.se',
  },
  'Loesungen-Bestandshalter': {
    de: 'Software für Asset Management: Mietverträge, Nachträge, Due Diligence · clearlea.se',
    en: 'Software for Asset Management: Leases, Amendments, Due Diligence · clearlea.se',
  },
  'Loesungen-Property': {
    de: 'Software für Property Management: Mandatsübernahme, Nebenkosten, Wartung · clearlea.se',
    en: 'Software for Property Management: Onboarding, Service Charges, Maintenance · clearlea.se',
  },
  'Loesungen-Filialisten': {
    de: 'Nebenkostenprüfung und Fristenmanagement für Filialisten · clearlea.se',
    en: 'Service Charge Audits and Deadline Management for Multi-Site Retailers · clearlea.se',
  },
  'KI-Teams': {
    de: 'MCP-Server für Immobiliendaten: KI mit Quelle und Kontrolle · clearlea.se',
    en: 'MCP Server for Real Estate Data: AI with Sources and Control · clearlea.se',
  },
  'Trust-Center': {
    de: 'Trust Center: Sicherheit, Datenschutz und KI-Grundsätze · clearlea.se',
    en: 'Trust Center: Security, Data Protection and AI Principles · clearlea.se',
  },
  Ressourcen: {
    de: 'Ressourcen: News, Produkt-Updates und Werkzeuge · clearlea.se',
    en: 'Resources: News, Product Updates and Tools · clearlea.se',
  },
  Unternehmen: {
    de: 'Über clearlea.se: Operations Intelligence aus Berlin',
    en: 'About clearlea.se: Operations Intelligence from Berlin',
  },
  Gespraech: {
    de: 'Gespräch mit Hieronymus Deutsch buchen · clearlea.se',
    en: 'Book a Call with Hieronymus Deutsch · clearlea.se',
  },
  Impressum: { de: 'Impressum · clearlea.se', en: 'Imprint · clearlea.se' },
  Datenschutz: { de: 'Datenschutzerklärung · clearlea.se', en: 'Privacy Policy · clearlea.se' },
  AGB: { de: 'AGB · clearlea.se', en: 'Terms and Conditions · clearlea.se' },
  NotFound: { de: 'Seite nicht gefunden · clearlea.se', en: 'Page not found · clearlea.se' },
};

// Meta descriptions (search snippets and link previews), max ~155 characters so Google and
// LinkedIn do not cut them. Built only from approved page copy and claims. Pages without an
// entry use their hero subline.
export const DESCRIPTIONS = {
  Home: {
    de: 'clearlea.se liest jeden Mietvertrag mit allen Nachträgen, zeigt, was Aufmerksamkeit braucht, und erledigt Routine in auditierbaren KI-Workflows.',
    en: 'clearlea.se reads every lease with all its amendments, shows what needs attention next and handles the routine in auditable AI workflows.',
  },
  Plattform: {
    de: 'Daten mit Historie, ein Cockpit für das, was Aufmerksamkeit braucht, und KI-Workflows mit Verantwortlichen. Angebunden an Ihre Systeme.',
    en: 'Data with history, a cockpit for what needs attention and AI workflows with an owner for every step. Connected to your systems.',
  },
  'Loesungen-Bestandshalter': {
    de: 'Für Asset Manager, Fonds und Family Offices: ein gültiger Stand für jedes Objekt, aus allen Verträgen und Nachträgen. Mit Quelle bis zur Klausel.',
    en: 'For asset managers, funds and family offices: one valid state for every property, from all leases and amendments. With a source down to the clause.',
  },
  'Loesungen-Property': {
    de: 'Für Verwalter und Facility Manager: neue Mandate in Tagen arbeitsfähig, Nebenkosten vorbereitet, Routine mit Beleg erledigt.',
    en: 'For property and facility managers: new mandates up and running in days, service charges prepared, routine done with evidence.',
  },
  'Loesungen-Filialisten': {
    de: 'Für Unternehmen mit vielen Standorten: jede Nebenkostenabrechnung geprüft, jede Frist im Blick. Verträge in allen großen europäischen Sprachen.',
    en: 'For companies with many sites: every service charge statement checked, every deadline in view. Leases in all major European languages.',
  },
  'KI-Teams': {
    de: 'Ihre KI fragt geprüfte Mietvertragsdaten über den MCP-Server von clearlea.se ab: mit Quelle, Historie, Rechten und Audit-Trail.',
    en: 'Your AI queries verified lease data through the clearlea.se MCP server: with source, history, access rights and an audit trail.',
  },
  'Trust-Center': {
    de: 'Betriebsmodelle, KI-Grundsätze und 9 eingebaute Garantien. Gehostet in Deutschland, DSGVO-konform, kein KI-Training mit Ihren Daten.',
    en: 'Deployment models, AI principles and 9 built-in guarantees. Hosted in Germany, GDPR-compliant, no AI training on your data.',
  },
  Impressum: { de: 'Impressum von clearlea.se: Anbieter, Kontakt und Registereintrag.', en: 'Imprint of clearlea.se: provider, contact and company registration (German).' },
  Datenschutz: { de: 'Datenschutzerklärung von clearlea.se: wie wir personenbezogene Daten auf dieser Website verarbeiten.', en: 'Privacy policy of clearlea.se: how we process personal data on this website (German).' },
  AGB: { de: 'Allgemeine Geschäftsbedingungen von clearlea.se.', en: 'Terms and conditions of clearlea.se (German).' },
  NotFound: { de: 'Diese Seite fehlt in der Akte. Zur Startseite von clearlea.se.', en: 'This page is missing from the file. Go to the clearlea.se home page.' },
};

// Short page names for breadcrumbs in search results.
export const LABELS = {
  Home: { de: 'Startseite', en: 'Home' },
  Plattform: { de: 'Plattform', en: 'Platform' },
  'Loesungen-Bestandshalter': { de: 'Bestandshalter & Asset Management', en: 'Owners & Asset Management' },
  'Loesungen-Property': { de: 'Property & Facility Management', en: 'Property & Facility Management' },
  'Loesungen-Filialisten': { de: 'Filialisten & Unternehmen', en: 'Multi-Site Retailers & Corporates' },
  'KI-Teams': { de: 'Für KI- & IT-Teams', en: 'For AI & IT Teams' },
  'Trust-Center': { de: 'Trust Center', en: 'Trust Center' },
  Ressourcen: { de: 'Ressourcen', en: 'Resources' },
  Unternehmen: { de: 'Unternehmen', en: 'Company' },
  Gespraech: { de: 'Gespräch', en: 'Book a call' },
  Impressum: { de: 'Impressum', en: 'Imprint' },
  Datenschutz: { de: 'Datenschutz', en: 'Privacy' },
  AGB: { de: 'AGB', en: 'Terms' },
};
