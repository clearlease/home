document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';
    let currentLang = defaultLang;
    const supportedLangs = ['de', 'en', 'nl', 'fr'];
    let translations = {};

    const loadTranslations = async (lang) => {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Could not load ${lang}.json`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            // Fallback to default language if translation file is missing
            if (lang !== defaultLang) {
                return await loadTranslations(defaultLang);
            }
        }
    };

    const applyTranslations = (translations) => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.innerHTML = translations[key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
    };

    const updateMeta = (translations) => {
        const title = translations['meta.title'];
        const description = translations['meta.description'];
        if (title) {
            document.title = title;
        }
        const descriptionTag = document.querySelector('meta[name="description"]');
        if (descriptionTag && description) {
            descriptionTag.setAttribute('content', description);
        }
    };

    const updateLangAttribute = (lang) => {
        document.documentElement.lang = lang;
    };

    const updateLangSwitcher = (lang) => {
        const langTextElement = document.getElementById('current-lang-text');
        if (langTextElement) {
            langTextElement.textContent = lang.toUpperCase();
        }
    };

    const setLanguage = async (lang) => {
        if (!supportedLangs.includes(lang)) {
            lang = defaultLang;
        }
        currentLang = lang;
        localStorage.setItem('lang', lang);
        const loadedTranslations = await loadTranslations(lang);
        if (loadedTranslations) {
            translations = loadedTranslations;
            applyTranslations(translations);
            updateMeta(translations);
            updateLangAttribute(lang);
            updateLangSwitcher(lang);
            document.dispatchEvent(new CustomEvent('translationsLoaded'));
        }
        lucide.createIcons();
    };

    window.setLanguage = setLanguage;

    window.getTranslation = (key) => {
        return translations[key] || key;
    };

    const getInitialLang = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get('lang');
        if (langFromUrl && supportedLangs.includes(langFromUrl)) {
            return langFromUrl;
        }
        const savedLang = localStorage.getItem('lang');
        if (savedLang && supportedLangs.includes(savedLang)) {
            return savedLang;
        }
        const browserLang = navigator.language.split('-')[0];
        if (supportedLangs.includes(browserLang)) {
            return browserLang;
        }
        return defaultLang;
    };

    setLanguage(getInitialLang());
});