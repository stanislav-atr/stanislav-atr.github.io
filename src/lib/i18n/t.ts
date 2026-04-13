import { derived } from 'svelte/store';
import { locale } from './locale';
import { translations, type TranslationKey } from './translations';

function interpolate(template: string, params?: Record<string, string | number>): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (_, key) => {
		return params[key]?.toString() ?? `{${key}}`;
	});
}

export const t = derived(locale, ($locale) => {
	return (key: TranslationKey, params?: Record<string, string | number>): string => {
		const translation = translations[$locale][key];
		const resolved = translation || translations['en'][key];
		return interpolate(resolved, params);
	};
});
