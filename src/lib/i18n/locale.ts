import { writable } from 'svelte/store';
import type { Locale } from './translations';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'ru', 'kz'];

function getInitialLocale(): Locale {
    if (typeof window !== 'undefined') {
        // Read from DOM lang attribute (already set by inline script in app.html)
        const htmlLang = document.documentElement.lang as Locale;
        if (htmlLang && locales.includes(htmlLang)) {
            return htmlLang;
        }
    }
    return defaultLocale;
}

function createLocaleStore() {
    const { subscribe, set } = writable<Locale>(getInitialLocale());

    return {
        subscribe,
        set: (value: Locale) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('locale', value);
            }
            set(value);
        },
        init: () => {
            // Re-read in case store was created during SSR
            const current = getInitialLocale();
            if (current !== defaultLocale) {
                set(current);
            }
        }
    };
}

export const locale = createLocaleStore();
