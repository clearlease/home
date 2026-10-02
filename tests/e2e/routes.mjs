import { ROUTES } from '../../src/site.config.mjs';
export const DESIGN_PAGES = ['Home', 'Plattform', 'Loesungen-Bestandshalter', 'Loesungen-Property', 'Loesungen-Filialisten', 'KI-Teams', 'Trust-Center', 'Ressourcen', 'Unternehmen', 'Gespraech'];
export const LEGAL_PAGES = ['Impressum', 'Datenschutz', 'AGB'];
export const ALL = [];
for (const lang of ['de', 'en']) for (const page of [...DESIGN_PAGES, ...LEGAL_PAGES]) ALL.push({ page, lang, path: ROUTES[page][lang] });
