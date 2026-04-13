import { writable } from 'svelte/store';
import type { Locale } from './translations';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'ru', 'kz'];

function createLocaleStore() {
	const { subscribe, set, update } = writable<Locale>(defaultLocale);

	return {
		subscribe,
		set: (value: Locale) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('locale', value);
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const currentIndex = locales.indexOf(current);
				const nextIndex = (currentIndex + 1) % locales.length;
				const nextLocale = locales[nextIndex];
				if (typeof window !== 'undefined') {
					localStorage.setItem('locale', nextLocale);
				}
				return nextLocale;
			});
		},
		init: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem('locale') as Locale | null;
				if (stored && locales.includes(stored)) {
					set(stored);
				}
			}
		}
	};
}

export const locale = createLocaleStore();
